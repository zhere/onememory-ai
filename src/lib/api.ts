export interface ChatMessage { role: string; content: string; }
export interface ChatRequest { model: string; messages: ChatMessage[]; temperature?: number; max_tokens?: number; stream?: boolean; }
export interface MemorySearchParams { q: string; limit?: number; threshold?: number; }
export interface MemoryCreateBody { content: string; metadata?: any; project?: string; }
export interface ProjectsListParams { page?: number; limit?: number; }

export interface ApiClient {
  chatCompletions(body: ChatRequest): Promise<any>;
  memorySearch(params: MemorySearchParams): Promise<any>;
  memoryCreate(body: MemoryCreateBody): Promise<any>;
  projectsList(params?: ProjectsListParams): Promise<any>;
}

export type ApiConfig = {
  baseUrl: string;
  apiKey: string;
  useMock: boolean;
};

const DEFAULT_CONFIG: ApiConfig = {
  baseUrl: 'http://localhost:3001',
  apiKey: '',
  useMock: true,
};

const CONFIG_KEY = 'supermemory_api_config';

export function getApiConfig(): ApiConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return DEFAULT_CONFIG;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_CONFIG, ...parsed };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function setApiConfig(update: Partial<ApiConfig>): ApiConfig {
  const current = getApiConfig();
  const merged = { ...current, ...update };
  localStorage.setItem(CONFIG_KEY, JSON.stringify(merged));
  return merged;
}

class HttpApiClient implements ApiClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(cfg: ApiConfig) {
    this.baseUrl = cfg.baseUrl || DEFAULT_CONFIG.baseUrl;
    this.apiKey = cfg.apiKey || '';
  }

  private headers(contentType: string = 'application/json') {
    const headers: Record<string, string> = { 'Content-Type': contentType };
    if (this.apiKey) headers['Authorization'] = `Bearer ${this.apiKey}`;
    return headers;
  }

  async chatCompletions(body: ChatRequest): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/v1/chat/completions`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(body),
    });
    return res.json();
  }

  async memorySearch(params: MemorySearchParams): Promise<any> {
    const qs = new URLSearchParams({
      q: params.q,
      ...(params.limit ? { limit: String(params.limit) } : {}),
      ...(params.threshold ? { threshold: String(params.threshold) } : {}),
    }).toString();
    const res = await fetch(`${this.baseUrl}/api/v1/memory/search?${qs}`, {
      method: 'GET',
      headers: this.headers(),
    });
    return res.json();
  }

  async memoryCreate(body: MemoryCreateBody): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/v1/memory`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(body),
    });
    return res.json();
  }

  async projectsList(params: ProjectsListParams = {}): Promise<any> {
    const qs = new URLSearchParams({
      ...(params.page ? { page: String(params.page) } : {}),
      ...(params.limit ? { limit: String(params.limit) } : {}),
    }).toString();
    const url = `${this.baseUrl}/api/v1/projects${qs ? `?${qs}` : ''}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: this.headers(),
    });
    return res.json();
  }
}

class MockApiClient implements ApiClient {
  private delay<T>(data: T, ms = 600): Promise<T> { return new Promise(resolve => setTimeout(() => resolve(data), ms)); }

  async chatCompletions(_body: ChatRequest): Promise<any> {
    return this.delay({
      id: 'chatcmpl-mock',
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      choices: [{ message: { role: 'assistant', content: '这是来自Mock的回复：你好！' } }],
      usage: { prompt_tokens: 12, completion_tokens: 10, total_tokens: 22 },
    });
  }

  async memorySearch(params: MemorySearchParams): Promise<any> {
    return this.delay({
      memories: [
        { id: 'mem_mock_1', content: `与“${params.q}”相关的示例记忆`, similarity: 0.93 },
      ],
      total: 1,
    });
  }

  async memoryCreate(body: MemoryCreateBody): Promise<any> {
    return this.delay({ id: 'mem_mock_created', content: body.content, created_at: new Date().toISOString() }, 800);
  }

  async projectsList(): Promise<any> {
    return this.delay({
      projects: [
        { id: 'proj_mock_1', name: 'AI客服助手', status: 'active' },
        { id: 'proj_mock_2', name: '内容生成器', status: 'active' },
      ],
      pagination: { page: 1, limit: 20, total: 2 },
    });
  }
}

export function getApiClient(): ApiClient {
  const cfg = getApiConfig();
  if (cfg.useMock) return new MockApiClient();
  return new HttpApiClient(cfg);
}