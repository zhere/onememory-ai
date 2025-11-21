import Redis from 'ioredis';
import { config } from '../config';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string;
}

export class CacheService {
  private redis: Redis | null = null;
  private isInitialized = false;
  private defaultTTL = 3600; // 1 hour

  constructor() {}

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      if (!config.redis.url) {
        console.warn('Redis URL not configured, caching will be disabled');
        return;
      }

      this.redis = new Redis(config.redis.url, {
        retryDelayOnFailover: 100,
        enableReadyCheck: false,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
      });

      // Test connection
      await this.redis.ping();

      this.isInitialized = true;
      console.log('✅ Cache service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize cache service:', error);
      throw error;
    }
  }

  async get<T = any>(key: string, options: CacheOptions = {}): Promise<T | null> {
    if (!this.isInitialized || !this.redis) {
      return null;
    }

    try {
      const fullKey = this.buildKey(key, options.prefix);
      const value = await this.redis.get(fullKey);
      
      if (value === null) {
        return null;
      }

      return JSON.parse(value);
    } catch (error) {
      console.error('❌ Cache get failed:', error);
      return null;
    }
  }

  async set<T = any>(key: string, value: T, options: CacheOptions = {}): Promise<boolean> {
    if (!this.isInitialized || !this.redis) {
      return false;
    }

    try {
      const fullKey = this.buildKey(key, options.prefix);
      const serializedValue = JSON.stringify(value);
      const ttl = options.ttl || this.defaultTTL;

      await this.redis.setex(fullKey, ttl, serializedValue);
      return true;
    } catch (error) {
      console.error('❌ Cache set failed:', error);
      return false;
    }
  }

  async delete(key: string, options: CacheOptions = {}): Promise<boolean> {
    if (!this.isInitialized || !this.redis) {
      return false;
    }

    try {
      const fullKey = this.buildKey(key, options.prefix);
      const result = await this.redis.del(fullKey);
      return result > 0;
    } catch (error) {
      console.error('❌ Cache delete failed:', error);
      return false;
    }
  }

  async exists(key: string, options: CacheOptions = {}): Promise<boolean> {
    if (!this.isInitialized || !this.redis) {
      return false;
    }

    try {
      const fullKey = this.buildKey(key, options.prefix);
      const result = await this.redis.exists(fullKey);
      return result > 0;
    } catch (error) {
      console.error('❌ Cache exists check failed:', error);
      return false;
    }
  }

  async expire(key: string, ttl: number, options: CacheOptions = {}): Promise<boolean> {
    if (!this.isInitialized || !this.redis) {
      return false;
    }

    try {
      const fullKey = this.buildKey(key, options.prefix);
      const result = await this.redis.expire(fullKey, ttl);
      return result > 0;
    } catch (error) {
      console.error('❌ Cache expire failed:', error);
      return false;
    }
  }

  async getTTL(key: string, options: CacheOptions = {}): Promise<number> {
    if (!this.isInitialized || !this.redis) {
      return -1;
    }

    try {
      const fullKey = this.buildKey(key, options.prefix);
      return await this.redis.ttl(fullKey);
    } catch (error) {
      console.error('❌ Cache TTL check failed:', error);
      return -1;
    }
  }

  // Hash operations
  async hget<T = any>(key: string, field: string, options: CacheOptions = {}): Promise<T | null> {
    if (!this.isInitialized || !this.redis) {
      return null;
    }

    try {
      const fullKey = this.buildKey(key, options.prefix);
      const value = await this.redis.hget(fullKey, field);
      
      if (value === null) {
        return null;
      }

      return JSON.parse(value);
    } catch (error) {
      console.error('❌ Cache hget failed:', error);
      return null;
    }
  }

  async hset<T = any>(key: string, field: string, value: T, options: CacheOptions = {}): Promise<boolean> {
    if (!this.isInitialized || !this.redis) {
      return false;
    }

    try {
      const fullKey = this.buildKey(key, options.prefix);
      const serializedValue = JSON.stringify(value);
      
      await this.redis.hset(fullKey, field, serializedValue);
      
      // Set expiration if TTL is provided
      if (options.ttl) {
        await this.redis.expire(fullKey, options.ttl);
      }
      
      return true;
    } catch (error) {
      console.error('❌ Cache hset failed:', error);
      return false;
    }
  }

  async hgetall<T = any>(key: string, options: CacheOptions = {}): Promise<Record<string, T>> {
    if (!this.isInitialized || !this.redis) {
      return {};
    }

    try {
      const fullKey = this.buildKey(key, options.prefix);
      const hash = await this.redis.hgetall(fullKey);
      
      const result: Record<string, T> = {};
      for (const [field, value] of Object.entries(hash)) {
        try {
          result[field] = JSON.parse(value);
        } catch {
          result[field] = value as T;
        }
      }
      
      return result;
    } catch (error) {
      console.error('❌ Cache hgetall failed:', error);
      return {};
    }
  }

  async hdel(key: string, field: string, options: CacheOptions = {}): Promise<boolean> {
    if (!this.isInitialized || !this.redis) {
      return false;
    }

    try {
      const fullKey = this.buildKey(key, options.prefix);
      const result = await this.redis.hdel(fullKey, field);
      return result > 0;
    } catch (error) {
      console.error('❌ Cache hdel failed:', error);
      return false;
    }
  }

  // List operations
  async lpush<T = any>(key: string, value: T, options: CacheOptions = {}): Promise<number> {
    if (!this.isInitialized || !this.redis) {
      return 0;
    }

    try {
      const fullKey = this.buildKey(key, options.prefix);
      const serializedValue = JSON.stringify(value);
      
      const result = await this.redis.lpush(fullKey, serializedValue);
      
      // Set expiration if TTL is provided
      if (options.ttl) {
        await this.redis.expire(fullKey, options.ttl);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Cache lpush failed:', error);
      return 0;
    }
  }

  async rpop<T = any>(key: string, options: CacheOptions = {}): Promise<T | null> {
    if (!this.isInitialized || !this.redis) {
      return null;
    }

    try {
      const fullKey = this.buildKey(key, options.prefix);
      const value = await this.redis.rpop(fullKey);
      
      if (value === null) {
        return null;
      }

      return JSON.parse(value);
    } catch (error) {
      console.error('❌ Cache rpop failed:', error);
      return null;
    }
  }

  async lrange<T = any>(key: string, start: number, stop: number, options: CacheOptions = {}): Promise<T[]> {
    if (!this.isInitialized || !this.redis) {
      return [];
    }

    try {
      const fullKey = this.buildKey(key, options.prefix);
      const values = await this.redis.lrange(fullKey, start, stop);
      
      return values.map(value => {
        try {
          return JSON.parse(value);
        } catch {
          return value as T;
        }
      });
    } catch (error) {
      console.error('❌ Cache lrange failed:', error);
      return [];
    }
  }

  // Set operations
  async sadd<T = any>(key: string, value: T, options: CacheOptions = {}): Promise<boolean> {
    if (!this.isInitialized || !this.redis) {
      return false;
    }

    try {
      const fullKey = this.buildKey(key, options.prefix);
      const serializedValue = JSON.stringify(value);
      
      const result = await this.redis.sadd(fullKey, serializedValue);
      
      // Set expiration if TTL is provided
      if (options.ttl) {
        await this.redis.expire(fullKey, options.ttl);
      }
      
      return result > 0;
    } catch (error) {
      console.error('❌ Cache sadd failed:', error);
      return false;
    }
  }

  async smembers<T = any>(key: string, options: CacheOptions = {}): Promise<T[]> {
    if (!this.isInitialized || !this.redis) {
      return [];
    }

    try {
      const fullKey = this.buildKey(key, options.prefix);
      const values = await this.redis.smembers(fullKey);
      
      return values.map(value => {
        try {
          return JSON.parse(value);
        } catch {
          return value as T;
        }
      });
    } catch (error) {
      console.error('❌ Cache smembers failed:', error);
      return [];
    }
  }

  // Pattern-based operations
  async keys(pattern: string, options: CacheOptions = {}): Promise<string[]> {
    if (!this.isInitialized || !this.redis) {
      return [];
    }

    try {
      const fullPattern = this.buildKey(pattern, options.prefix);
      return await this.redis.keys(fullPattern);
    } catch (error) {
      console.error('❌ Cache keys failed:', error);
      return [];
    }
  }

  async deletePattern(pattern: string, options: CacheOptions = {}): Promise<number> {
    if (!this.isInitialized || !this.redis) {
      return 0;
    }

    try {
      const keys = await this.keys(pattern, options);
      if (keys.length === 0) {
        return 0;
      }

      const result = await this.redis.del(...keys);
      return result;
    } catch (error) {
      console.error('❌ Cache delete pattern failed:', error);
      return 0;
    }
  }

  // Atomic operations
  async increment(key: string, options: CacheOptions = {}): Promise<number> {
    if (!this.isInitialized || !this.redis) {
      return 0;
    }

    try {
      const fullKey = this.buildKey(key, options.prefix);
      const result = await this.redis.incr(fullKey);
      
      // Set expiration if TTL is provided
      if (options.ttl) {
        await this.redis.expire(fullKey, options.ttl);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Cache increment failed:', error);
      return 0;
    }
  }

  async decrement(key: string, options: CacheOptions = {}): Promise<number> {
    if (!this.isInitialized || !this.redis) {
      return 0;
    }

    try {
      const fullKey = this.buildKey(key, options.prefix);
      return await this.redis.decr(fullKey);
    } catch (error) {
      console.error('❌ Cache decrement failed:', error);
      return 0;
    }
  }

  // Batch operations
  async mget<T = any>(keys: string[], options: CacheOptions = {}): Promise<(T | null)[]> {
    if (!this.isInitialized || !this.redis) {
      return keys.map(() => null);
    }

    try {
      const fullKeys = keys.map(key => this.buildKey(key, options.prefix));
      const values = await this.redis.mget(...fullKeys);
      
      return values.map(value => {
        if (value === null) {
          return null;
        }
        try {
          return JSON.parse(value);
        } catch {
          return value as T;
        }
      });
    } catch (error) {
      console.error('❌ Cache mget failed:', error);
      return keys.map(() => null);
    }
  }

  async mset<T = any>(keyValuePairs: Array<[string, T]>, options: CacheOptions = {}): Promise<boolean> {
    if (!this.isInitialized || !this.redis) {
      return false;
    }

    try {
      const pipeline = this.redis.pipeline();
      
      for (const [key, value] of keyValuePairs) {
        const fullKey = this.buildKey(key, options.prefix);
        const serializedValue = JSON.stringify(value);
        const ttl = options.ttl || this.defaultTTL;
        
        pipeline.setex(fullKey, ttl, serializedValue);
      }
      
      await pipeline.exec();
      return true;
    } catch (error) {
      console.error('❌ Cache mset failed:', error);
      return false;
    }
  }

  // Cache-specific utility methods
  async getOrSet<T = any>(
    key: string,
    factory: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key, options);
    if (cached !== null) {
      return cached;
    }

    // Generate value and cache it
    const value = await factory();
    await this.set(key, value, options);
    return value;
  }

  async invalidateByPrefix(prefix: string): Promise<number> {
    return await this.deletePattern('*', { prefix });
  }

  // Session management
  async setSession(sessionId: string, data: any, ttl: number = 86400): Promise<boolean> {
    return await this.set(`session:${sessionId}`, data, { ttl });
  }

  async getSession<T = any>(sessionId: string): Promise<T | null> {
    return await this.get<T>(`session:${sessionId}`);
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    return await this.delete(`session:${sessionId}`);
  }

  // Rate limiting
  async checkRateLimit(key: string, limit: number, window: number): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
  }> {
    if (!this.isInitialized || !this.redis) {
      return { allowed: true, remaining: limit, resetTime: Date.now() + window * 1000 };
    }

    try {
      const fullKey = this.buildKey(`rate_limit:${key}`);
      const current = await this.redis.incr(fullKey);
      
      if (current === 1) {
        await this.redis.expire(fullKey, window);
      }
      
      const ttl = await this.redis.ttl(fullKey);
      const resetTime = Date.now() + ttl * 1000;
      
      return {
        allowed: current <= limit,
        remaining: Math.max(0, limit - current),
        resetTime,
      };
    } catch (error) {
      console.error('❌ Rate limit check failed:', error);
      return { allowed: true, remaining: limit, resetTime: Date.now() + window * 1000 };
    }
  }

  // Utility methods
  private buildKey(key: string, prefix?: string): string {
    const parts = [];
    
    if (prefix) {
      parts.push(prefix);
    }
    
    parts.push(key);
    
    return parts.join(':');
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (!this.redis) {
        return false;
      }

      const result = await this.redis.ping();
      return result === 'PONG';
    } catch (error) {
      console.error('Cache service health check failed:', error);
      return false;
    }
  }

  // Cleanup
  async close(): Promise<void> {
    if (this.redis) {
      this.redis.disconnect();
      this.redis = null;
      this.isInitialized = false;
      console.log('✅ Cache service connection closed');
    }
  }

  // Statistics
  async getStats(): Promise<{
    connected: boolean;
    memory: string;
    keys: number;
    hits: number;
    misses: number;
  }> {
    if (!this.isInitialized || !this.redis) {
      return {
        connected: false,
        memory: '0B',
        keys: 0,
        hits: 0,
        misses: 0,
      };
    }

    try {
      const info = await this.redis.info('memory');
      const stats = await this.redis.info('stats');
      const dbsize = await this.redis.dbsize();
      
      // Parse memory info
      const memoryMatch = info.match(/used_memory_human:(.+)/);
      const memory = memoryMatch ? memoryMatch[1].trim() : '0B';
      
      // Parse stats
      const hitsMatch = stats.match(/keyspace_hits:(\d+)/);
      const missesMatch = stats.match(/keyspace_misses:(\d+)/);
      
      return {
        connected: true,
        memory,
        keys: dbsize,
        hits: hitsMatch ? parseInt(hitsMatch[1]) : 0,
        misses: missesMatch ? parseInt(missesMatch[1]) : 0,
      };
    } catch (error) {
      console.error('❌ Failed to get cache stats:', error);
      return {
        connected: false,
        memory: '0B',
        keys: 0,
        hits: 0,
        misses: 0,
      };
    }
  }
}