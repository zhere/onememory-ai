import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Project {
  id: string
  name: string
  description: string
  status: "active" | "inactive" | "maintenance"
  createdAt: string
  lastActivity: string
  memoryCount: number
  requestCount: number
  owner: string
}

export const useProjectStore = defineStore('project', () => {
  const projects = ref<Project[]>([
    {
      id: "1",
      name: "AI客服助手",
      description: "智能客服系统，提供24/7客户支持",
      status: "active",
      createdAt: "2024-01-15",
      lastActivity: "2分钟前",
      memoryCount: 450,
      requestCount: 1250,
      owner: "张三"
    },
    {
      id: "2",
      name: "内容生成器",
      description: "基于AI的内容创作和优化工具",
      status: "active",
      createdAt: "2024-01-10",
      lastActivity: "1小时前",
      memoryCount: 320,
      requestCount: 890,
      owner: "李四"
    },
    {
      id: "3",
      name: "数据分析平台",
      description: "企业数据智能分析和可视化平台",
      status: "maintenance",
      createdAt: "2024-01-05",
      lastActivity: "1天前",
      memoryCount: 180,
      requestCount: 560,
      owner: "王五"
    }
  ])

  const selectedProjectId = ref<string | null>(projects.value.length > 0 ? projects.value[0].id : null)

  const selectProject = (id: string) => {
    if (projects.value.some(p => p.id === id)) {
      selectedProjectId.value = id
    }
  }

  const selectedProject = computed(() => {
    return projects.value.find(p => p.id === selectedProjectId.value)
  })

  const addProject = (project: Omit<Project, 'id' | 'createdAt' | 'lastActivity' | 'memoryCount' | 'requestCount' | 'owner'>) => {
    const newProject: Project = {
      ...project,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
      lastActivity: "刚刚",
      memoryCount: 0,
      requestCount: 0,
      owner: "当前用户"
    }
    projects.value.push(newProject)
    if (!selectedProjectId.value) {
      selectProject(newProject.id)
    }
  }

  const updateProject = (id: string, updates: Partial<Project>) => {
    const index = projects.value.findIndex(p => p.id === id)
    if (index !== -1) {
      projects.value[index] = { ...projects.value[index], ...updates }
    }
  }

  const removeProject = (id: string) => {
    projects.value = projects.value.filter(p => p.id !== id)
    if (selectedProjectId.value === id) {
      selectedProjectId.value = projects.value.length > 0 ? projects.value[0].id : null
    }
  }

  const getProjectById = computed(() => {
    return (id: string) => projects.value.find(p => p.id === id)
  })

  return {
    projects,
    selectedProjectId,
    selectProject,
    selectedProject,
    addProject,
    updateProject,
    removeProject,
    getProjectById,
  }
})
