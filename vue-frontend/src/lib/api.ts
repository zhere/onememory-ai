import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export interface Memory {
  id: string
  content: string
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface MemoryImportBody {
  data: any[]
  userId: string
  projectId?: string
}

export interface Project {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
}

export const memoriesApi = {
  getAll: () => api.get<Memory[]>('/v1/memories'),
  getById: (id: string) => api.get<Memory>(`/v1/memories/${id}`),
  create: (data: Partial<Memory>) => api.post<Memory>('/v1/memories', data),
  update: (id: string, data: Partial<Memory>) => api.put<Memory>(`/v1/memories/${id}`, data),
  delete: (id: string) => api.delete(`/v1/memories/${id}`),
  import: (data: MemoryImportBody) => api.post('/v1/memories/import', data),
  export: (params: { userId: string; projectId?: string }) => api.post('/v1/memories/export', params),
}

// Agent接口定义
export interface Agent {
  id: string
  name: string
  description?: string
  type: string
  model: string
  systemPrompt: string
  tools: string[]
  memoryEnabled: boolean
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
  timeout?: number
  retryPolicy?: 'none' | 'retry_once' | 'retry_multiple'
  logLevel?: 'error' | 'warn' | 'info' | 'debug'
}

// 工具接口定义
export interface Tool {
  id: string
  name: string
  description?: string
  type: string
  category: string
  parameters: {
    name: string
    type: string
    required: boolean
    description?: string
    defaultValue?: any
    validation?: string
  }[]
  outputSchema?: Record<string, any>
  executionTimeout: number
  retryPolicy: 'none' | 'retry_once' | 'retry_multiple'
  environment: string
  permissions: {
    roles: string[]
    agents: string[]
  }
  logLevel: 'error' | 'warn' | 'info' | 'debug'
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export const projectsApi = {
  getAll: () => api.get<Project[]>('/v1/projects'),
  getById: (id: string) => api.get<Project>(`/v1/projects/${id}`),
  create: (data: Partial<Project>) => api.post<Project>('/v1/projects', data),
  update: (id: string, data: Partial<Project>) => api.put<Project>(`/v1/projects/${id}`, data),
  delete: (id: string) => api.delete(`/v1/projects/${id}`),
}

// Agent API
export const agentsApi = {
  getAll: () => api.get<Agent[]>('/v1/agents'),
  getById: (id: string) => api.get<Agent>(`/v1/agents/${id}`),
  create: (data: Partial<Agent>) => api.post<Agent>('/v1/agents', data),
  update: (id: string, data: Partial<Agent>) => api.put<Agent>(`/v1/agents/${id}`, data),
  delete: (id: string) => api.delete(`/v1/agents/${id}`),
  updateStatus: (id: string, status: 'active' | 'inactive') => api.patch<Agent>(`/v1/agents/${id}/status`, { status }),
}

// 工具 API
export const toolsApi = {
  getAll: () => api.get<Tool[]>('/v1/tools'),
  getById: (id: string) => api.get<Tool>(`/v1/tools/${id}`),
  create: (data: Partial<Tool>) => api.post<Tool>('/v1/tools', data),
  update: (id: string, data: Partial<Tool>) => api.put<Tool>(`/v1/tools/${id}`, data),
  delete: (id: string) => api.delete(`/v1/tools/${id}`),
  updateStatus: (id: string, status: 'active' | 'inactive') => api.patch<Tool>(`/v1/tools/${id}/status`, { status }),
}

export default api