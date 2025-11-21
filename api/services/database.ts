import { Pool, PoolClient } from 'pg';
import { AppError } from '../middleware/errorHandler';

interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl?: boolean;
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
}

class DatabaseService {
  private pool: Pool;
  private static instance: DatabaseService;

  private constructor() {
    const config: DatabaseConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'supermemory',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      ssl: process.env.NODE_ENV === 'production',
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
    };

    this.pool = new Pool(config);

    // Handle pool errors
    this.pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public async query(text: string, params?: any[]): Promise<any> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } catch (error) {
      console.error('Database query error:', error);
      throw new AppError('Database query failed', 500);
    } finally {
      client.release();
    }
  }

  public async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Transaction error:', error);
      throw new AppError('Transaction failed', 500);
    } finally {
      client.release();
    }
  }

  // User operations
  public async createUser(userData: {
    email: string;
    password: string;
    name?: string;
    plan?: string;
  }) {
    const { email, password, name, plan = 'free' } = userData;
    const query = `
      INSERT INTO users (email, password, name, plan, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING id, email, name, plan, created_at
    `;
    const result = await this.query(query, [email, password, name, plan]);
    return result.rows[0];
  }

  public async getUserByEmail(email: string) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await this.query(query, [email]);
    return result.rows[0];
  }

  public async getUserById(id: string) {
    const query = 'SELECT id, email, name, plan, created_at, updated_at FROM users WHERE id = $1';
    const result = await this.query(query, [id]);
    return result.rows[0];
  }

  public async updateUser(id: string, updates: any) {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    
    const query = `
      UPDATE users 
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1
      RETURNING id, email, name, plan, updated_at
    `;
    const result = await this.query(query, [id, ...values]);
    return result.rows[0];
  }

  // Project operations
  public async createProject(projectData: {
    name: string;
    description?: string;
    userId: string;
    settings?: any;
  }) {
    const { name, description, userId, settings = {} } = projectData;
    const query = `
      INSERT INTO projects (name, description, user_id, settings, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING *
    `;
    const result = await this.query(query, [name, description, userId, JSON.stringify(settings)]);
    return result.rows[0];
  }

  public async getProjectsByUserId(userId: string) {
    const query = 'SELECT * FROM projects WHERE user_id = $1 ORDER BY created_at DESC';
    const result = await this.query(query, [userId]);
    return result.rows;
  }

  public async getProjectById(id: string) {
    const query = 'SELECT * FROM projects WHERE id = $1';
    const result = await this.query(query, [id]);
    return result.rows[0];
  }

  public async updateProject(id: string, updates: any) {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    
    const query = `
      UPDATE projects 
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    const result = await this.query(query, [id, ...values]);
    return result.rows[0];
  }

  public async deleteProject(id: string) {
    const query = 'DELETE FROM projects WHERE id = $1 RETURNING *';
    const result = await this.query(query, [id]);
    return result.rows[0];
  }

  // Memory operations
  public async createMemory(memoryData: {
    content: string;
    metadata?: any;
    projectId: string;
    userId: string;
    embedding?: number[];
  }) {
    const { content, metadata = {}, projectId, userId, embedding } = memoryData;
    const query = `
      INSERT INTO memories (content, metadata, project_id, user_id, embedding, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *
    `;
    const result = await this.query(query, [
      content,
      JSON.stringify(metadata),
      projectId,
      userId,
      embedding ? JSON.stringify(embedding) : null
    ]);
    return result.rows[0];
  }

  public async getMemoriesByProjectId(projectId: string, limit = 50, offset = 0) {
    const query = `
      SELECT * FROM memories 
      WHERE project_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `;
    const result = await this.query(query, [projectId, limit, offset]);
    return result.rows;
  }

  public async searchMemories(query: string, projectId?: string, limit = 10) {
    let sqlQuery = `
      SELECT *, ts_rank(to_tsvector('english', content), plainto_tsquery('english', $1)) as rank
      FROM memories 
      WHERE to_tsvector('english', content) @@ plainto_tsquery('english', $1)
    `;
    const params = [query];

    if (projectId) {
      sqlQuery += ' AND project_id = $2';
      params.push(projectId);
    }

    sqlQuery += ' ORDER BY rank DESC LIMIT $' + (params.length + 1);
    params.push(limit.toString());

    const result = await this.query(sqlQuery, params);
    return result.rows;
  }

  public async deleteMemory(id: string) {
    const query = 'DELETE FROM memories WHERE id = $1 RETURNING *';
    const result = await this.query(query, [id]);
    return result.rows[0];
  }

  // API Token operations
  public async createApiToken(tokenData: {
    name: string;
    userId: string;
    permissions: string[];
    expiresAt?: Date;
  }) {
    const { name, userId, permissions, expiresAt } = tokenData;
    const token = this.generateApiToken();
    const hashedToken = await this.hashToken(token);
    
    const query = `
      INSERT INTO api_tokens (name, user_id, token_hash, permissions, expires_at, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING id, name, permissions, expires_at, created_at
    `;
    const result = await this.query(query, [
      name,
      userId,
      hashedToken,
      JSON.stringify(permissions),
      expiresAt
    ]);
    
    return { ...result.rows[0], token };
  }

  public async getApiTokensByUserId(userId: string) {
    const query = `
      SELECT id, name, permissions, expires_at, last_used_at, created_at, updated_at, is_active
      FROM api_tokens 
      WHERE user_id = $1 
      ORDER BY created_at DESC
    `;
    const result = await this.query(query, [userId]);
    return result.rows;
  }

  public async validateApiToken(token: string) {
    const hashedToken = await this.hashToken(token);
    const query = `
      SELECT at.*, u.id as user_id, u.email, u.plan
      FROM api_tokens at
      JOIN users u ON at.user_id = u.id
      WHERE at.token_hash = $1 AND at.is_active = true
      AND (at.expires_at IS NULL OR at.expires_at > NOW())
    `;
    const result = await this.query(query, [hashedToken]);
    
    if (result.rows.length > 0) {
      // Update last used timestamp
      await this.query(
        'UPDATE api_tokens SET last_used_at = NOW() WHERE id = $1',
        [result.rows[0].id]
      );
    }
    
    return result.rows[0];
  }

  public async updateApiToken(id: string, updates: any) {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    
    const query = `
      UPDATE api_tokens 
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1
      RETURNING id, name, permissions, expires_at, is_active, updated_at
    `;
    const result = await this.query(query, [id, ...values]);
    return result.rows[0];
  }

  public async deleteApiToken(id: string) {
    const query = 'DELETE FROM api_tokens WHERE id = $1 RETURNING *';
    const result = await this.query(query, [id]);
    return result.rows[0];
  }

  // Configuration operations
  public async getConfig(section?: string, userId?: string, projectId?: string) {
    let query = 'SELECT * FROM configurations WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (section) {
      query += ` AND section = $${paramIndex}`;
      params.push(section);
      paramIndex++;
    }

    if (userId) {
      query += ` AND user_id = $${paramIndex}`;
      params.push(userId);
      paramIndex++;
    }

    if (projectId) {
      query += ` AND project_id = $${paramIndex}`;
      params.push(projectId);
      paramIndex++;
    }

    const result = await this.query(query, params);
    return result.rows;
  }

  public async updateConfig(configData: {
    section: string;
    key: string;
    value: any;
    userId?: string;
    projectId?: string;
  }) {
    const { section, key, value, userId, projectId } = configData;
    
    const query = `
      INSERT INTO configurations (section, key, value, user_id, project_id, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      ON CONFLICT (section, key, COALESCE(user_id, ''), COALESCE(project_id, ''))
      DO UPDATE SET value = $3, updated_at = NOW()
      RETURNING *
    `;
    
    const result = await this.query(query, [
      section,
      key,
      JSON.stringify(value),
      userId || null,
      projectId || null
    ]);
    return result.rows[0];
  }

  // Utility methods
  private generateApiToken(): string {
    const crypto = require('crypto');
    return 'sk-' + crypto.randomBytes(32).toString('hex');
  }

  private async hashToken(token: string): Promise<string> {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  public async close(): Promise<void> {
    await this.pool.end();
  }

  public async healthCheck(): Promise<boolean> {
    try {
      await this.query('SELECT 1');
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }
}

export default DatabaseService.getInstance();