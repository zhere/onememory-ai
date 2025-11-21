import { CacheService } from './CacheService';

export interface ConfigOptions {
  userId?: string;
  projectId?: string;
  includeSecrets?: boolean;
}

export interface LLMProviderConfig {
  name: string;
  apiKey?: string;
  baseUrl?: string;
  models: string[];
  defaultModel: string;
  maxTokens: number;
  temperature: number;
  enabled: boolean;
}

export interface SegmentationConfig {
  strategy: 'fixed' | 'semantic' | 'hybrid';
  chunkSize: number;
  overlap: number;
  separators: string[];
  minChunkSize: number;
  maxChunkSize: number;
}

export interface MemoryConfig {
  maxMemories: number;
  similarityThreshold: number;
  retentionDays: number;
  compressionEnabled: boolean;
  autoOptimization: boolean;
}

export interface ProxyConfig {
  enabled: boolean;
  targetUrl: string;
  timeout: number;
  retries: number;
  rateLimit: {
    enabled: boolean;
    maxRequests: number;
    windowMs: number;
  };
  caching: {
    enabled: boolean;
    ttl: number;
  };
}

export interface VectorDbConfig {
  provider: 'pinecone' | 'weaviate' | 'qdrant' | 'chroma';
  dimensions: number;
  indexType: string;
  similarityMetric: 'cosine' | 'euclidean' | 'dot';
  batchSize: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  details: Record<string, any>;
}

export class ConfigManager {
  private cache: CacheService;
  private defaultConfigs: Map<string, any>;

  constructor() {
    this.cache = new CacheService();
    this.defaultConfigs = new Map();
    this.initializeDefaults();
  }

  /**
   * Initialize default configurations
   */
  private initializeDefaults(): void {
    // LLM Provider defaults
    this.defaultConfigs.set('llm', {
      providers: {
        openai: {
          name: 'OpenAI',
          baseUrl: 'https://api.openai.com/v1',
          models: ['gpt-4', 'gpt-3.5-turbo'],
          defaultModel: 'gpt-3.5-turbo',
          maxTokens: 4096,
          temperature: 0.7,
          enabled: true,
        },
        anthropic: {
          name: 'Anthropic',
          baseUrl: 'https://api.anthropic.com',
          models: ['claude-3-opus', 'claude-3-sonnet'],
          defaultModel: 'claude-3-sonnet',
          maxTokens: 4096,
          temperature: 0.7,
          enabled: false,
        },
      },
      defaultProvider: 'openai',
    });

    // Segmentation defaults
    this.defaultConfigs.set('segmentation', {
      strategy: 'semantic',
      chunkSize: 1000,
      overlap: 200,
      separators: ['\n\n', '\n', '. ', '! ', '? '],
      minChunkSize: 100,
      maxChunkSize: 2000,
    });

    // Memory defaults
    this.defaultConfigs.set('memory', {
      maxMemories: 1000,
      similarityThreshold: 0.7,
      retentionDays: 30,
      compressionEnabled: true,
      autoOptimization: true,
    });

    // Proxy defaults
    this.defaultConfigs.set('proxy', {
      enabled: true,
      targetUrl: 'https://api.openai.com',
      timeout: 30000,
      retries: 3,
      rateLimit: {
        enabled: true,
        maxRequests: 100,
        windowMs: 60000,
      },
      caching: {
        enabled: true,
        ttl: 300,
      },
    });

    // Vector DB defaults
    this.defaultConfigs.set('vectorDb', {
      provider: 'pinecone',
      dimensions: 1536,
      indexType: 'cosine',
      similarityMetric: 'cosine',
      batchSize: 100,
    });
  }

  /**
   * Get configuration for a specific section
   */
  async getConfig(section: string, options: ConfigOptions = {}): Promise<any> {
    try {
      const cacheKey = this.getCacheKey(section, options);
      
      // Try to get from cache first
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // Get from defaults or database
      let config = this.defaultConfigs.get(section) || {};

      // Apply user/project specific overrides
      if (options.userId || options.projectId) {
        const overrides = await this.getConfigOverrides(section, options);
        config = { ...config, ...overrides };
      }

      // Filter out secrets if not requested
      if (!options.includeSecrets) {
        config = this.filterSecrets(config);
      }

      // Cache the result
      await this.cache.set(cacheKey, JSON.stringify(config), 300); // 5 minutes TTL

      return config;
    } catch (error) {
      console.error('Error getting configuration:', error);
      return this.defaultConfigs.get(section) || {};
    }
  }

  /**
   * Get all configuration sections
   */
  async getAllConfig(options: ConfigOptions = {}): Promise<Record<string, any>> {
    try {
      const sections = ['llm', 'segmentation', 'memory', 'proxy', 'vectorDb'];
      const configs: Record<string, any> = {};

      for (const section of sections) {
        configs[section] = await this.getConfig(section, options);
      }

      return configs;
    } catch (error) {
      console.error('Error getting all configurations:', error);
      return {};
    }
  }

  /**
   * Update configuration for a specific section
   */
  async updateConfig(section: string, config: any, options: ConfigOptions = {}): Promise<any> {
    try {
      // Validate configuration
      const validation = await this.validateConfig(section, config);
      if (!validation.valid) {
        throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
      }

      // Store configuration (in a real implementation, this would go to database)
      const cacheKey = this.getCacheKey(section, options);
      await this.cache.set(cacheKey, JSON.stringify(config), 3600); // 1 hour TTL

      // Invalidate related cache entries
      await this.invalidateConfigCache(section, options);

      return config;
    } catch (error) {
      console.error('Error updating configuration:', error);
      throw error;
    }
  }

  /**
   * Get LLM provider configuration
   */
  async getLLMConfig(options: ConfigOptions = {}): Promise<any> {
    return this.getConfig('llm', options);
  }

  /**
   * Update LLM provider configuration
   */
  async updateLLMConfig(provider: string, config: LLMProviderConfig, options: ConfigOptions = {}): Promise<any> {
    try {
      const currentConfig = await this.getLLMConfig(options);
      const updatedConfig = {
        ...currentConfig,
        providers: {
          ...currentConfig.providers,
          [provider]: config,
        },
      };

      return this.updateConfig('llm', updatedConfig, options);
    } catch (error) {
      console.error('Error updating LLM configuration:', error);
      throw error;
    }
  }

  /**
   * Get segmentation configuration
   */
  async getSegmentationConfig(options: ConfigOptions = {}): Promise<SegmentationConfig> {
    return this.getConfig('segmentation', options);
  }

  /**
   * Update segmentation configuration
   */
  async updateSegmentationConfig(config: Partial<SegmentationConfig>, options: ConfigOptions = {}): Promise<SegmentationConfig> {
    try {
      const currentConfig = await this.getSegmentationConfig(options);
      const updatedConfig = { ...currentConfig, ...config };
      return this.updateConfig('segmentation', updatedConfig, options);
    } catch (error) {
      console.error('Error updating segmentation configuration:', error);
      throw error;
    }
  }

  /**
   * Get memory configuration
   */
  async getMemoryConfig(options: ConfigOptions = {}): Promise<MemoryConfig> {
    return this.getConfig('memory', options);
  }

  /**
   * Update memory configuration
   */
  async updateMemoryConfig(config: Partial<MemoryConfig>, options: ConfigOptions = {}): Promise<MemoryConfig> {
    try {
      const currentConfig = await this.getMemoryConfig(options);
      const updatedConfig = { ...currentConfig, ...config };
      return this.updateConfig('memory', updatedConfig, options);
    } catch (error) {
      console.error('Error updating memory configuration:', error);
      throw error;
    }
  }

  /**
   * Get proxy configuration
   */
  async getProxyConfig(options: ConfigOptions = {}): Promise<ProxyConfig> {
    return this.getConfig('proxy', options);
  }

  /**
   * Update proxy configuration
   */
  async updateProxyConfig(config: Partial<ProxyConfig>, options: ConfigOptions = {}): Promise<ProxyConfig> {
    try {
      const currentConfig = await this.getProxyConfig(options);
      const updatedConfig = { ...currentConfig, ...config };
      return this.updateConfig('proxy', updatedConfig, options);
    } catch (error) {
      console.error('Error updating proxy configuration:', error);
      throw error;
    }
  }

  /**
   * Get vector database configuration
   */
  async getVectorDbConfig(options: ConfigOptions = {}): Promise<VectorDbConfig> {
    return this.getConfig('vectorDb', options);
  }

  /**
   * Update vector database configuration
   */
  async updateVectorDbConfig(config: Partial<VectorDbConfig>, options: ConfigOptions = {}): Promise<VectorDbConfig> {
    try {
      const currentConfig = await this.getVectorDbConfig(options);
      const updatedConfig = { ...currentConfig, ...config };
      return this.updateConfig('vectorDb', updatedConfig, options);
    } catch (error) {
      console.error('Error updating vector database configuration:', error);
      throw error;
    }
  }

  /**
   * Validate configuration
   */
  async validateConfig(section: string, config: any): Promise<ValidationResult> {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
    };

    try {
      switch (section) {
        case 'llm':
          this.validateLLMConfig(config, result);
          break;
        case 'segmentation':
          this.validateSegmentationConfig(config, result);
          break;
        case 'memory':
          this.validateMemoryConfig(config, result);
          break;
        case 'proxy':
          this.validateProxyConfig(config, result);
          break;
        case 'vectorDb':
          this.validateVectorDbConfig(config, result);
          break;
        default:
          result.errors.push(`Unknown configuration section: ${section}`);
      }

      result.valid = result.errors.length === 0;
    } catch (error) {
      result.valid = false;
      result.errors.push(`Validation error: ${error.message}`);
    }

    return result;
  }

  /**
   * Reset configuration to defaults
   */
  async resetConfig(section: string, options: ConfigOptions = {}): Promise<any> {
    try {
      const defaultConfig = this.defaultConfigs.get(section);
      if (!defaultConfig) {
        throw new Error(`No default configuration found for section: ${section}`);
      }

      // Clear cache
      await this.invalidateConfigCache(section, options);

      return defaultConfig;
    } catch (error) {
      console.error('Error resetting configuration:', error);
      throw error;
    }
  }

  /**
   * Export configuration
   */
  async exportConfig(options: ConfigOptions = {}): Promise<any> {
    try {
      const config = await this.getAllConfig(options);
      
      return {
        version: '1.0',
        timestamp: new Date().toISOString(),
        config,
      };
    } catch (error) {
      console.error('Error exporting configuration:', error);
      throw error;
    }
  }

  /**
   * Import configuration
   */
  async importConfig(data: any, options: ConfigOptions & { overwrite?: boolean } = {}): Promise<ImportResult> {
    const result: ImportResult = {
      imported: 0,
      skipped: 0,
      errors: [],
    };

    try {
      if (!data.config) {
        throw new Error('Invalid import data: missing config section');
      }

      for (const [section, config] of Object.entries(data.config)) {
        try {
          // Validate configuration
          const validation = await this.validateConfig(section, config);
          if (!validation.valid) {
            result.errors.push(`${section}: ${validation.errors.join(', ')}`);
            continue;
          }

          // Check if should overwrite
          if (!options.overwrite) {
            const existing = await this.getConfig(section, options);
            if (existing && Object.keys(existing).length > 0) {
              result.skipped++;
              continue;
            }
          }

          // Import configuration
          await this.updateConfig(section, config, options);
          result.imported++;
        } catch (error) {
          result.errors.push(`${section}: ${error.message}`);
        }
      }
    } catch (error) {
      result.errors.push(`Import error: ${error.message}`);
    }

    return result;
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<HealthStatus> {
    try {
      const cacheHealth = await this.cache.healthCheck();
      
      return {
        status: cacheHealth.status === 'healthy' ? 'healthy' : 'unhealthy',
        details: {
          cache: cacheHealth,
          configSections: Array.from(this.defaultConfigs.keys()),
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error.message,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  // Private helper methods

  private getCacheKey(section: string, options: ConfigOptions): string {
    const parts = ['config', section];
    if (options.userId) parts.push(`user:${options.userId}`);
    if (options.projectId) parts.push(`project:${options.projectId}`);
    return parts.join(':');
  }

  private async getConfigOverrides(section: string, options: ConfigOptions): Promise<any> {
    // In a real implementation, this would query the database for user/project specific overrides
    return {};
  }

  private filterSecrets(config: any): any {
    const filtered = JSON.parse(JSON.stringify(config));
    
    // Remove sensitive fields
    const sensitiveFields = ['apiKey', 'password', 'secret', 'token'];
    
    const filterObject = (obj: any): void => {
      for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          filterObject(obj[key]);
        } else if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
          obj[key] = '***';
        }
      }
    };

    filterObject(filtered);
    return filtered;
  }

  private async invalidateConfigCache(section: string, options: ConfigOptions): Promise<void> {
    const patterns = [
      `config:${section}:*`,
      this.getCacheKey(section, options),
    ];

    for (const pattern of patterns) {
      await this.cache.deletePattern(pattern);
    }
  }

  private validateLLMConfig(config: any, result: ValidationResult): void {
    if (!config.providers || typeof config.providers !== 'object') {
      result.errors.push('LLM config must have providers object');
      return;
    }

    for (const [name, provider] of Object.entries(config.providers)) {
      const p = provider as any;
      if (!p.models || !Array.isArray(p.models) || p.models.length === 0) {
        result.errors.push(`Provider ${name} must have at least one model`);
      }
      if (!p.defaultModel || !p.models.includes(p.defaultModel)) {
        result.errors.push(`Provider ${name} defaultModel must be one of the available models`);
      }
    }
  }

  private validateSegmentationConfig(config: any, result: ValidationResult): void {
    if (!['fixed', 'semantic', 'hybrid'].includes(config.strategy)) {
      result.errors.push('Segmentation strategy must be fixed, semantic, or hybrid');
    }
    if (config.chunkSize <= 0) {
      result.errors.push('Chunk size must be positive');
    }
    if (config.overlap < 0 || config.overlap >= config.chunkSize) {
      result.errors.push('Overlap must be non-negative and less than chunk size');
    }
  }

  private validateMemoryConfig(config: any, result: ValidationResult): void {
    if (config.maxMemories <= 0) {
      result.errors.push('Max memories must be positive');
    }
    if (config.similarityThreshold < 0 || config.similarityThreshold > 1) {
      result.errors.push('Similarity threshold must be between 0 and 1');
    }
    if (config.retentionDays <= 0) {
      result.errors.push('Retention days must be positive');
    }
  }

  private validateProxyConfig(config: any, result: ValidationResult): void {
    if (config.enabled && !config.targetUrl) {
      result.errors.push('Target URL is required when proxy is enabled');
    }
    if (config.timeout <= 0) {
      result.errors.push('Timeout must be positive');
    }
    if (config.retries < 0) {
      result.errors.push('Retries must be non-negative');
    }
  }

  private validateVectorDbConfig(config: any, result: ValidationResult): void {
    if (!['pinecone', 'weaviate', 'qdrant', 'chroma'].includes(config.provider)) {
      result.errors.push('Vector DB provider must be pinecone, weaviate, qdrant, or chroma');
    }
    if (config.dimensions <= 0) {
      result.errors.push('Dimensions must be positive');
    }
    if (!['cosine', 'euclidean', 'dot'].includes(config.similarityMetric)) {
      result.errors.push('Similarity metric must be cosine, euclidean, or dot');
    }
  }
}