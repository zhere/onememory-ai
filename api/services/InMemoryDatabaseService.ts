import { config } from '../config';
import { User, Project, Conversation, Message, TokenUsageLog, ApiKey, UsageLog, TokenConfig } from '../../shared/types';

// Simple in-memory database for local development
export class InMemoryDatabaseService {
  private users: Map<string, User> = new Map();
  private projects: Map<string, Project> = new Map();
  private conversations: Map<string, Conversation> = new Map();
  private messages: Map<string, Message> = new Map();
  private apiKeys: Map<string, ApiKey> = new Map();
  private tokenUsageLogs: Map<string, TokenUsageLog> = new Map();
  private usageLogs: Map<string, UsageLog> = new Map();
  private tokenConfigs: Map<string, TokenConfig> = new Map();
  private projectToTokenConfigMap: Map<string, string> = new Map();
  
  private isInitialized = false;

  constructor() {}

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('⚠️  Using in-memory database for local development');
      console.log('⚠️  Data will not persist between restarts');
      
      // Create a default user for testing
      const defaultUser: User = {
        id: 'default-user-123',
        email: 'test@example.com',
        name: 'Test User',
        plan: 'free',
        apiKeysLimit: 10,
        projectsLimit: 5,
        monthlyTokenLimit: 100000,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      this.users.set(defaultUser.id, defaultUser);
      
      // Create a default API key
      const defaultApiKey: ApiKey = {
        id: 'default-api-key-123',
        userId: defaultUser.id,
        key: 'test-api-key-12345',
        name: 'Default Test Key',
        isActive: true,
        permissions: ['read', 'write'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      this.apiKeys.set(defaultApiKey.id, defaultApiKey);
      
      this.isInitialized = true;
      console.log('✅ In-memory database service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize in-memory database service:', error);
      throw error;
    }
  }

  // Helper method to generate UUID-like strings
  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  // User operations
  async createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const newUser: User = {
      ...user,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.users.set(newUser.id, newUser);
    return newUser;
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const user = this.users.get(id);
    if (!user) return null;

    const updatedUser: User = {
      ...user,
      ...updates,
      updatedAt: new Date(),
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Project operations
  async createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const newProject: Project = {
      ...project,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.projects.set(newProject.id, newProject);
    return newProject;
  }

  async getProjectById(id: string): Promise<Project | null> {
    return this.projects.get(id) || null;
  }

  async getProjectsByUserId(userId: string): Promise<Project[]> {
    const userProjects: Project[] = [];
    for (const project of this.projects.values()) {
      if (project.userId === userId) {
        userProjects.push(project);
      }
    }
    return userProjects.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
    const project = this.projects.get(id);
    if (!project) return null;

    const updatedProject: Project = {
      ...project,
      ...updates,
      updatedAt: new Date(),
    };
    
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  // API Key operations
  async createApiKey(apiKey: Omit<ApiKey, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiKey> {
    const newApiKey: ApiKey = {
      ...apiKey,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.apiKeys.set(newApiKey.id, newApiKey);
    return newApiKey;
  }

  async getApiKeyByKey(key: string): Promise<ApiKey | null> {
    for (const apiKey of this.apiKeys.values()) {
      if (apiKey.key === key) {
        return apiKey;
      }
    }
    return null;
  }

  async getApiKeysByUserId(userId: string): Promise<ApiKey[]> {
    const userApiKeys: ApiKey[] = [];
    for (const apiKey of this.apiKeys.values()) {
      if (apiKey.userId === userId) {
        userApiKeys.push(apiKey);
      }
    }
    return userApiKeys.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updateApiKey(id: string, updates: Partial<ApiKey>): Promise<ApiKey | null> {
    const apiKey = this.apiKeys.get(id);
    if (!apiKey) return null;

    const updatedApiKey: ApiKey = {
      ...apiKey,
      ...updates,
      updatedAt: new Date(),
    };
    
    this.apiKeys.set(id, updatedApiKey);
    return updatedApiKey;
  }

  // Conversation operations
  async createConversation(conversation: Omit<Conversation, 'id' | 'createdAt' | 'updatedAt'>): Promise<Conversation> {
    const newConversation: Conversation = {
      ...conversation,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.conversations.set(newConversation.id, newConversation);
    return newConversation;
  }

  async getConversationById(id: string): Promise<Conversation | null> {
    return this.conversations.get(id) || null;
  }

  async getConversationsByProjectId(projectId: string): Promise<Conversation[]> {
    const projectConversations: Conversation[] = [];
    for (const conversation of this.conversations.values()) {
      if (conversation.projectId === projectId) {
        projectConversations.push(conversation);
      }
    }
    return projectConversations.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation | null> {
    const conversation = this.conversations.get(id);
    if (!conversation) return null;

    const updatedConversation: Conversation = {
      ...conversation,
      ...updates,
      updatedAt: new Date(),
    };
    
    this.conversations.set(id, updatedConversation);
    return updatedConversation;
  }

  // Message operations
  async createMessage(message: Omit<Message, 'id' | 'createdAt'>): Promise<Message> {
    const newMessage: Message = {
      ...message,
      id: this.generateId(),
      createdAt: new Date(),
    };
    
    this.messages.set(newMessage.id, newMessage);
    return newMessage;
  }

  async getMessagesByConversationId(conversationId: string): Promise<Message[]> {
    const conversationMessages: Message[] = [];
    for (const message of this.messages.values()) {
      if (message.conversationId === conversationId) {
        conversationMessages.push(message);
      }
    }
    return conversationMessages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  // Token usage operations
  async createTokenUsageLog(log: Omit<TokenUsageLog, 'id' | 'createdAt'>): Promise<TokenUsageLog> {
    const newLog: TokenUsageLog = {
      ...log,
      id: this.generateId(),
      createdAt: new Date(),
    };
    
    this.tokenUsageLogs.set(newLog.id, newLog);
    return newLog;
  }

  async getTokenUsageLogsByUserId(userId: string): Promise<TokenUsageLog[]> {
    const userLogs: TokenUsageLog[] = [];
    for (const log of this.tokenUsageLogs.values()) {
      if (log.userId === userId) {
        userLogs.push(log);
      }
    }
    return userLogs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Usage log operations
  async createUsageLog(log: Omit<UsageLog, 'id' | 'createdAt'>): Promise<UsageLog> {
    const newLog: UsageLog = {
      ...log,
      id: this.generateId(),
      createdAt: new Date(),
    };
    
    this.usageLogs.set(newLog.id, newLog);
    return newLog;
  }

  async getUsageLogsByUserId(userId: string): Promise<UsageLog[]> {
    const userLogs: UsageLog[] = [];
    for (const log of this.usageLogs.values()) {
      if (log.userId === userId) {
        userLogs.push(log);
      }
    }
    return userLogs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Token Config operations
  async createTokenConfig(tokenConfig: Omit<TokenConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<TokenConfig> {
    // Check if token config already exists for this project
    const existingConfigId = this.projectToTokenConfigMap.get(tokenConfig.projectId);
    
    if (existingConfigId) {
      // Update existing config
      const existingConfig = this.tokenConfigs.get(existingConfigId);
      if (existingConfig) {
        const updatedConfig: TokenConfig = {
          ...existingConfig,
          ...tokenConfig,
          updatedAt: new Date(),
        };
        this.tokenConfigs.set(existingConfigId, updatedConfig);
        return updatedConfig;
      }
    }
    
    // Create new config
    const newTokenConfig: TokenConfig = {
      ...tokenConfig,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.tokenConfigs.set(newTokenConfig.id, newTokenConfig);
    this.projectToTokenConfigMap.set(newTokenConfig.projectId, newTokenConfig.id);
    return newTokenConfig;
  }

  async getTokenConfigByProjectId(projectId: string): Promise<TokenConfig | null> {
    const configId = this.projectToTokenConfigMap.get(projectId);
    if (!configId) return null;
    return this.tokenConfigs.get(configId) || null;
  }

  async updateTokenConfig(id: string, updates: Partial<TokenConfig>): Promise<TokenConfig | null> {
    const tokenConfig = this.tokenConfigs.get(id);
    if (!tokenConfig) return null;

    const updatedTokenConfig: TokenConfig = {
      ...tokenConfig,
      ...updates,
      updatedAt: new Date(),
    };
    
    this.tokenConfigs.set(id, updatedTokenConfig);
    
    // Update project mapping if projectId changed
    if (updates.projectId && updates.projectId !== tokenConfig.projectId) {
      this.projectToTokenConfigMap.delete(tokenConfig.projectId);
      this.projectToTokenConfigMap.set(updates.projectId, id);
    }
    
    return updatedTokenConfig;
  }

  async deleteTokenConfig(id: string): Promise<boolean> {
    const tokenConfig = this.tokenConfigs.get(id);
    if (!tokenConfig) return false;
    
    this.tokenConfigs.delete(id);
    this.projectToTokenConfigMap.delete(tokenConfig.projectId);
    return true;
  }

  // Utility methods
  async query<T = any>(text: string, params?: any[]): Promise<T[]> {
    console.warn('⚠️  In-memory database: query method not fully implemented');
    return [];
  }

  async transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
    // In-memory database doesn't need transactions
    return callback(this);
  }
}

// Export singleton instance
export const databaseService = new InMemoryDatabaseService();