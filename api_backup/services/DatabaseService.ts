import { Pool, PoolClient } from 'pg';
import { config } from '../config';
import { User, Project, Conversation, Message, TokenUsageLog, ApiKey, UsageLog } from '../../shared/types';

export class DatabaseService {
  private pool: Pool | null = null;
  private isInitialized = false;

  constructor() {}

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      if (!config.database.url) {
        console.warn('Database URL not configured, database operations will be disabled');
        return;
      }

      this.pool = new Pool({
        connectionString: config.database.url,
        ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
        max: config.database.maxConnections,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      // Test connection
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();

      this.isInitialized = true;
      console.log('✅ Database service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize database service:', error);
      throw error;
    }
  }

  async query<T = any>(text: string, params?: any[]): Promise<T[]> {
    if (!this.pool) {
      throw new Error('Database not initialized');
    }

    try {
      const result = await this.pool.query(text, params);
      return result.rows;
    } catch (error) {
      console.error('❌ Database query failed:', error);
      throw error;
    }
  }

  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    if (!this.pool) {
      throw new Error('Database not initialized');
    }

    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // User operations
  async createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const query = `
      INSERT INTO users (email, name, plan, api_keys_limit, projects_limit, monthly_token_limit)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const values = [
      user.email,
      user.name,
      user.plan,
      user.apiKeysLimit,
      user.projectsLimit,
      user.monthlyTokenLimit,
    ];

    const result = await this.query<User>(query, values);
    return this.mapUserRow(result[0]);
  }

  async getUserById(id: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await this.query<any>(query, [id]);
    return result.length > 0 ? this.mapUserRow(result[0]) : null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await this.query<any>(query, [email]);
    return result.length > 0 ? this.mapUserRow(result[0]) : null;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined && key !== 'id' && key !== 'createdAt') {
        fields.push(`${this.camelToSnake(key)} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (fields.length === 0) return null;

    const query = `
      UPDATE users 
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    
    values.push(id);
    const result = await this.query<any>(query, values);
    return result.length > 0 ? this.mapUserRow(result[0]) : null;
  }

  // Project operations
  async createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const query = `
      INSERT INTO projects (user_id, name, description, proxy_url, is_active, segmentation_config, token_config)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const values = [
      project.userId,
      project.name,
      project.description,
      project.proxyUrl,
      project.isActive,
      JSON.stringify(project.segmentationConfig),
      JSON.stringify(project.tokenConfig),
    ];

    const result = await this.query<any>(query, values);
    return this.mapProjectRow(result[0]);
  }

  async getProjectById(id: string): Promise<Project | null> {
    const query = 'SELECT * FROM projects WHERE id = $1';
    const result = await this.query<any>(query, [id]);
    return result.length > 0 ? this.mapProjectRow(result[0]) : null;
  }

  async getProjectsByUserId(userId: string): Promise<Project[]> {
    const query = 'SELECT * FROM projects WHERE user_id = $1 ORDER BY created_at DESC';
    const result = await this.query<any>(query, [userId]);
    return result.map(row => this.mapProjectRow(row));
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined && key !== 'id' && key !== 'createdAt') {
        if (key === 'segmentationConfig' || key === 'tokenConfig') {
          fields.push(`${this.camelToSnake(key)} = $${paramIndex}`);
          values.push(JSON.stringify(value));
        } else {
          fields.push(`${this.camelToSnake(key)} = $${paramIndex}`);
          values.push(value);
        }
        paramIndex++;
      }
    }

    if (fields.length === 0) return null;

    const query = `
      UPDATE projects 
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    
    values.push(id);
    const result = await this.query<any>(query, values);
    return result.length > 0 ? this.mapProjectRow(result[0]) : null;
  }

  async deleteProject(id: string): Promise<boolean> {
    const query = 'DELETE FROM projects WHERE id = $1';
    const result = await this.query(query, [id]);
    return result.length > 0;
  }

  // Conversation operations
  async createConversation(conversation: Omit<Conversation, 'id' | 'createdAt' | 'updatedAt'>): Promise<Conversation> {
    const query = `
      INSERT INTO conversations (project_id, session_id, title, metadata)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const values = [
      conversation.projectId,
      conversation.sessionId,
      conversation.title,
      JSON.stringify(conversation.metadata || {}),
    ];

    const result = await this.query<any>(query, values);
    return this.mapConversationRow(result[0]);
  }

  async getConversationById(id: string): Promise<Conversation | null> {
    const query = 'SELECT * FROM conversations WHERE id = $1';
    const result = await this.query<any>(query, [id]);
    return result.length > 0 ? this.mapConversationRow(result[0]) : null;
  }

  async getConversationBySessionId(sessionId: string): Promise<Conversation | null> {
    const query = 'SELECT * FROM conversations WHERE session_id = $1';
    const result = await this.query<any>(query, [sessionId]);
    return result.length > 0 ? this.mapConversationRow(result[0]) : null;
  }

  async getConversationsByProjectId(projectId: string, limit: number = 50): Promise<Conversation[]> {
    const query = `
      SELECT * FROM conversations 
      WHERE project_id = $1 
      ORDER BY updated_at DESC 
      LIMIT $2
    `;
    const result = await this.query<any>(query, [projectId, limit]);
    return result.map(row => this.mapConversationRow(row));
  }

  // Message operations
  async createMessage(message: Omit<Message, 'id' | 'createdAt'>): Promise<Message> {
    const query = `
      INSERT INTO messages (conversation_id, role, content, token_count, metadata)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const values = [
      message.conversationId,
      message.role,
      typeof message.content === 'string' ? message.content : JSON.stringify(message.content),
      message.tokenCount,
      JSON.stringify(message.metadata || {}),
    ];

    const result = await this.query<any>(query, values);
    return this.mapMessageRow(result[0]);
  }

  async getMessagesByConversationId(conversationId: string): Promise<Message[]> {
    const query = `
      SELECT * FROM messages 
      WHERE conversation_id = $1 
      ORDER BY created_at ASC
    `;
    const result = await this.query<any>(query, [conversationId]);
    return result.map(row => this.mapMessageRow(row));
  }

  // API Key operations
  async createApiKey(apiKey: Omit<ApiKey, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiKey> {
    const query = `
      INSERT INTO api_keys (user_id, name, key_hash, permissions, rate_limit, is_active, expires_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const values = [
      apiKey.userId,
      apiKey.name,
      apiKey.keyHash,
      JSON.stringify(apiKey.permissions),
      apiKey.rateLimit,
      apiKey.isActive,
      apiKey.expiresAt,
    ];

    const result = await this.query<any>(query, values);
    return this.mapApiKeyRow(result[0]);
  }

  async getApiKeyByHash(keyHash: string): Promise<ApiKey | null> {
    const query = 'SELECT * FROM api_keys WHERE key_hash = $1 AND is_active = true';
    const result = await this.query<any>(query, [keyHash]);
    return result.length > 0 ? this.mapApiKeyRow(result[0]) : null;
  }

  async getApiKeysByUserId(userId: string): Promise<ApiKey[]> {
    const query = 'SELECT * FROM api_keys WHERE user_id = $1 ORDER BY created_at DESC';
    const result = await this.query<any>(query, [userId]);
    return result.map(row => this.mapApiKeyRow(row));
  }

  async updateApiKey(id: string, updates: Partial<ApiKey>): Promise<ApiKey | null> {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined && key !== 'id' && key !== 'createdAt') {
        if (key === 'permissions') {
          fields.push(`${this.camelToSnake(key)} = $${paramIndex}`);
          values.push(JSON.stringify(value));
        } else {
          fields.push(`${this.camelToSnake(key)} = $${paramIndex}`);
          values.push(value);
        }
        paramIndex++;
      }
    }

    if (fields.length === 0) return null;

    const query = `
      UPDATE api_keys 
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    
    values.push(id);
    const result = await this.query<any>(query, values);
    return result.length > 0 ? this.mapApiKeyRow(result[0]) : null;
  }

  // Token usage logging
  async logTokenUsage(usage: Omit<TokenUsageLog, 'id' | 'createdAt'>): Promise<TokenUsageLog> {
    const query = `
      INSERT INTO token_usage_logs (user_id, project_id, session_id, model, input_tokens, output_tokens, total_tokens, cost, metadata)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    
    const values = [
      usage.userId,
      usage.projectId,
      usage.sessionId,
      usage.model,
      usage.inputTokens,
      usage.outputTokens,
      usage.totalTokens,
      usage.cost,
      JSON.stringify(usage.metadata || {}),
    ];

    const result = await this.query<any>(query, values);
    return this.mapTokenUsageRow(result[0]);
  }

  async getTokenUsageByUser(userId: string, startDate?: Date, endDate?: Date): Promise<TokenUsageLog[]> {
    let query = 'SELECT * FROM token_usage_logs WHERE user_id = $1';
    const values = [userId];
    let paramIndex = 2;

    if (startDate) {
      query += ` AND created_at >= $${paramIndex}`;
      values.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND created_at <= $${paramIndex}`;
      values.push(endDate);
    }

    query += ' ORDER BY created_at DESC';
    
    const result = await this.query<any>(query, values);
    return result.map(row => this.mapTokenUsageRow(row));
  }

  async getTokenUsageStats(userId: string, period: 'day' | 'week' | 'month' = 'month'): Promise<{
    totalTokens: number;
    totalCost: number;
    requestCount: number;
  }> {
    const periodMap = {
      day: '1 day',
      week: '7 days',
      month: '30 days',
    };

    const query = `
      SELECT 
        COALESCE(SUM(total_tokens), 0) as total_tokens,
        COALESCE(SUM(cost), 0) as total_cost,
        COUNT(*) as request_count
      FROM token_usage_logs 
      WHERE user_id = $1 
        AND created_at >= NOW() - INTERVAL '${periodMap[period]}'
    `;

    const result = await this.query<any>(query, [userId]);
    const row = result[0];
    
    return {
      totalTokens: parseInt(row.total_tokens) || 0,
      totalCost: parseFloat(row.total_cost) || 0,
      requestCount: parseInt(row.request_count) || 0,
    };
  }

  // Usage logging
  async logUsage(usage: Omit<UsageLog, 'id' | 'createdAt'>): Promise<UsageLog> {
    const query = `
      INSERT INTO usage_logs (user_id, project_id, action, details, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const values = [
      usage.userId,
      usage.projectId,
      usage.action,
      JSON.stringify(usage.details || {}),
      usage.ipAddress,
      usage.userAgent,
    ];

    const result = await this.query<any>(query, values);
    return this.mapUsageLogRow(result[0]);
  }

  // Utility methods
  private camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }

  private snakeToCamel(str: string): string {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  private mapUserRow(row: any): User {
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      plan: row.plan,
      apiKeysLimit: row.api_keys_limit,
      projectsLimit: row.projects_limit,
      monthlyTokenLimit: row.monthly_token_limit,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private mapProjectRow(row: any): Project {
    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      description: row.description,
      proxyUrl: row.proxy_url,
      isActive: row.is_active,
      segmentationConfig: JSON.parse(row.segmentation_config || '{}'),
      tokenConfig: JSON.parse(row.token_config || '{}'),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private mapConversationRow(row: any): Conversation {
    return {
      id: row.id,
      projectId: row.project_id,
      sessionId: row.session_id,
      title: row.title,
      metadata: JSON.parse(row.metadata || '{}'),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private mapMessageRow(row: any): Message {
    let content: string | any;
    try {
      content = JSON.parse(row.content);
    } catch {
      content = row.content;
    }

    return {
      id: row.id,
      conversationId: row.conversation_id,
      role: row.role,
      content,
      tokenCount: row.token_count,
      metadata: JSON.parse(row.metadata || '{}'),
      createdAt: new Date(row.created_at),
    };
  }

  private mapApiKeyRow(row: any): ApiKey {
    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      keyHash: row.key_hash,
      permissions: JSON.parse(row.permissions || '[]'),
      rateLimit: row.rate_limit,
      isActive: row.is_active,
      expiresAt: row.expires_at ? new Date(row.expires_at) : undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private mapTokenUsageRow(row: any): TokenUsageLog {
    return {
      id: row.id,
      userId: row.user_id,
      projectId: row.project_id,
      sessionId: row.session_id,
      model: row.model,
      inputTokens: row.input_tokens,
      outputTokens: row.output_tokens,
      totalTokens: row.total_tokens,
      cost: parseFloat(row.cost),
      metadata: JSON.parse(row.metadata || '{}'),
      createdAt: new Date(row.created_at),
    };
  }

  private mapUsageLogRow(row: any): UsageLog {
    return {
      id: row.id,
      userId: row.user_id,
      projectId: row.project_id,
      action: row.action,
      details: JSON.parse(row.details || '{}'),
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      createdAt: new Date(row.created_at),
    };
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (!this.pool) {
        return false;
      }

      const result = await this.query('SELECT 1 as health');
      return result.length > 0 && result[0].health === 1;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  // Cleanup
  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      this.isInitialized = false;
      console.log('✅ Database connection closed');
    }
  }
}