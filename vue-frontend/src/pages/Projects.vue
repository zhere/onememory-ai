<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">项目管理</h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">点击项目卡片以切换，当前选中项目将高亮显示。</p>
        </div>
        <button @click="handleCreateProject" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <Plus class="w-4 h-4 mr-2" />
          新建项目
        </button>
      </div>

    <div class="bg-white dark:bg-gray-800 shadow rounded-lg">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="flex-1">
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search class="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="搜索项目..."
                v-model="searchQuery"
                class="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <Filter class="h-4 w-4 text-gray-400" />
            <select
              v-model="statusFilter"
              class="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">所有状态</option>
              <option value="active">运行中</option>
              <option value="inactive">已停用</option>
              <option value="maintenance">维护中</option>
            </select>
          </div>
        </div>
      </div>

      <div class="divide-y divide-gray-200 dark:divide-gray-700">
        <div 
          v-for="project in filteredProjects" 
          :key="project.id" 
          @click="selectProject(project.id)"
          :class="[
            'px-6 py-4 cursor-pointer',
            project.id === selectedProjectId ? 'bg-blue-50 dark:bg-blue-900/50' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
          ]"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span class="text-white font-medium text-sm">{{ project.name.charAt(0) }}</span>
                </div>
              </div>
              <div class="ml-4">
                <div class="flex items-center">
                  <h3 class="text-sm font-medium text-gray-900 dark:text-white">{{ project.name }}</h3>
                  <span :class="['ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getStatusColor(project.status)]">
                    {{ getStatusText(project.status) }}
                  </span>
                </div>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ project.description }}</p>
                <div class="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-4">
                  <div class="flex items-center">
                    <Calendar class="w-3 h-3 mr-1" />
                    创建于 {{ project.createdAt }}
                  </div>
                  <div class="flex items-center">
                    <Activity class="w-3 h-3 mr-1" />
                    最后活动 {{ project.lastActivity }}
                  </div>
                  <div class="flex items-center">
                    <Users class="w-3 h-3 mr-1" />
                    {{ project.owner }}
                  </div>
                </div>
              </div>
            </div>
            <div class="flex items-center space-x-4">
              <div class="text-right">
                <div class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ project.memoryCount }} 记忆
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  {{ project.requestCount }} 请求
                </div>
              </div>
              <div class="relative flex items-center space-x-2">
                <button 
                  @click.stop="handleViewProject(project)"
                  class="p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <Eye class="w-4 h-4" />
                </button>
                <button 
                  @click.stop="handleEditProject(project.id)"
                  class="p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <Edit class="w-4 h-4" />
                </button>
                <button 
                  @click.stop="handleDeleteProject(project.id)"
                  class="p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
                <button 
                  @click.stop="openMenuId = openMenuId === project.id ? null : project.id"
                  class="p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <MoreVertical class="w-4 h-4" />
                </button>

                <div 
                  v-if="openMenuId === project.id" 
                  class="absolute right-0 top-8 z-10 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow"
                >
                  <button
                    @click.stop="handleToggleStatus(project.id); openMenuId = null"
                    class="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    切换状态（当前：{{ getStatusText(project.status) }}）
                  </button>
                  <button
                    @click.stop="handleDuplicateProject(project.id); openMenuId = null"
                    class="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    复制项目
                  </button>
                  <button
                    @click.stop="handleDeleteProject(project.id); openMenuId = null"
                    class="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-50 dark:text-red-400 dark:hover:bg-gray-700"
                  >
                    删除项目
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="filteredProjects.length === 0" class="text-center py-12">
      <div class="mx-auto h-12 w-12 text-gray-400">
        <Folder class="h-12 w-12" />
      </div>
      <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">没有找到项目</h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ searchQuery ? '尝试调整搜索条件' : '还没有创建任何项目' }}</p>
    </div>

    <!-- View Project Dialog -->
    <Dialog :isOpen="isViewModalOpen" @close="closeViewModal">
      <template #title>项目详情</template>
      <template #content>
        <div v-if="currentProject" class="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <div>名称：{{ currentProject.name }}</div>
          <div>描述：{{ currentProject.description }}</div>
          <div>状态：{{ getStatusText(currentProject.status) }}</div>
          <div>负责人：{{ currentProject.owner }}</div>
          <div>创建时间：{{ currentProject.createdAt }}</div>
          <div>最近活动：{{ currentProject.lastActivity }}</div>
          <div>记忆数：{{ currentProject.memoryCount }}</div>
          <div>请求数：{{ currentProject.requestCount }}</div>
        </div>
      </template>
      <template #footer>
        <button @click="closeViewModal" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">关闭</button>
      </template>
    </Dialog>

    <!-- Create Project Dialog -->
    <Dialog :isOpen="isCreateModalOpen" @close="closeCreateModal">
      <template #title>创建新项目</template>
      <template #content>
        <div class="space-y-4">
          <div>
            <label for="projectName" class="block text-sm font-medium text-gray-700 dark:text-gray-300">项目名称 <span class="text-red-500">*</span></label>
            <input 
              type="text" 
              id="projectName" 
              v-model="newProjectName" 
              placeholder="请输入项目名称" 
              class="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-white"
              required
            >
          </div>
          
          <div>
            <label for="projectDescription" class="block text-sm font-medium text-gray-700 dark:text-gray-300">项目描述</label>
            <textarea 
              id="projectDescription" 
              v-model="newProjectDescription" 
              rows="3" 
              placeholder="请输入项目描述" 
              class="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-white"
            ></textarea>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="projectOwner" class="block text-sm font-medium text-gray-700 dark:text-gray-300">项目负责人 <span class="text-red-500">*</span></label>
              <select 
                id="projectOwner" 
                v-model="newProjectOwner" 
                class="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-white"
                required
              >
                <option value="">请选择负责人</option>
                <option value="张三">张三</option>
                <option value="李四">李四</option>
                <option value="王五">王五</option>
                <option value="赵六">赵六</option>
              </select>
            </div>
            
            <div>
              <label for="projectStatus" class="block text-sm font-medium text-gray-700 dark:text-gray-300">项目状态 <span class="text-red-500">*</span></label>
              <select 
                id="projectStatus" 
                v-model="newProjectStatus" 
                class="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-white"
                required
              >
                <option value="active">运行中</option>
                <option value="inactive">已停用</option>
                <option value="maintenance">维护中</option>
              </select>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="projectType" class="block text-sm font-medium text-gray-700 dark:text-gray-300">项目类型 <span class="text-red-500">*</span></label>
              <select 
                id="projectType" 
                v-model="newProjectType" 
                class="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-white"
                required
              >
                <option value="">请选择项目类型</option>
                <option value="ai">AI应用</option>
                <option value="data">数据平台</option>
                <option value="web">Web应用</option>
                <option value="mobile">移动应用</option>
                <option value="automation">自动化工具</option>
              </select>
            </div>
            
            <div>
              <label for="projectPriority" class="block text-sm font-medium text-gray-700 dark:text-gray-300">项目优先级</label>
              <select 
                id="projectPriority" 
                v-model="newProjectPriority" 
                class="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-white"
              >
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
                <option value="urgent">紧急</option>
              </select>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="projectStartDate" class="block text-sm font-medium text-gray-700 dark:text-gray-300">开始日期</label>
              <input 
                type="date" 
                id="projectStartDate" 
                v-model="newProjectStartDate" 
                class="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-white"
              >
            </div>
            
            <div>
              <label for="projectEndDate" class="block text-sm font-medium text-gray-700 dark:text-gray-300">预计结束日期</label>
              <input 
                type="date" 
                id="projectEndDate" 
                v-model="newProjectEndDate" 
                class="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-white"
              >
            </div>
          </div>
          
          <div>
            <label for="projectTags" class="block text-sm font-medium text-gray-700 dark:text-gray-300">项目标签</label>
            <input 
              type="text" 
              id="projectTags" 
              v-model="newProjectTags" 
              placeholder="请输入标签，用逗号分隔" 
              class="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-white"
            >
          </div>
        </div>
      </template>
      <template #footer>
        <button @click="closeCreateModal" class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">取消</button>
        <button 
          @click="saveNewProject" 
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          创建
        </button>
      </template>
    </Dialog>

    <!-- Delete Project Confirmation Dialog -->
    <Dialog :isOpen="isDeleteModalOpen" @close="closeDeleteModal">
      <template #title>确认删除项目</template>
      <template #content>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          您确定要删除这个项目吗？此操作无法撤销。
        </p>
      </template>
      <template #footer>
        <button @click="closeDeleteModal" class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">取消</button>
        <button @click="confirmDeleteProject" class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">确认删除</button>
      </template>
    </Dialog>

    <!-- Edit Project Dialog -->
    <Dialog :isOpen="isEditModalOpen" @close="closeEditModal">
      <template #title>编辑项目</template>
      <template #content>
        <div class="space-y-4">
          <div>
            <label for="editProjectName" class="block text-sm font-medium text-gray-700 dark:text-gray-300">项目名称</label>
            <input type="text" id="editProjectName" v-model="editedProjectName" class="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-white">
          </div>
          <div>
            <label for="editProjectDescription" class="block text-sm font-medium text-gray-700 dark:text-gray-300">项目描述 (可选)</label>
            <textarea id="editProjectDescription" v-model="editedProjectDescription" rows="3" class="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-white"></textarea>
          </div>
          <div>
            <label for="editProjectStatus" class="block text-sm font-medium text-gray-700 dark:text-gray-300">项目状态</label>
            <select id="editProjectStatus" v-model="editedProjectStatus" class="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-white">
              <option value="active">运行中</option>
              <option value="inactive">已停用</option>
              <option value="maintenance">维护中</option>
            </select>
          </div>
        </div>
      </template>
      <template #footer>
        <button @click="closeEditModal" class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">取消</button>
        <button @click="saveEditedProject" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">保存</button>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useProjectStore, type Project } from '@/stores/project'
import { Plus, Search, MoreVertical, Calendar, Folder, Filter, Eye, Edit, Trash2, Activity, Users } from 'lucide-vue-next'
import Dialog from '@/components/ui/Dialog.vue'

const projectStore = useProjectStore()
const { projects, selectedProjectId } = storeToRefs(projectStore)
const { addProject, updateProject, removeProject, selectProject } = projectStore

const searchQuery = ref("")
const statusFilter = ref("all")
const isCreateModalOpen = ref(false)
const newProjectName = ref('')
const newProjectDescription = ref('')
const newProjectOwner = ref('')
const newProjectStatus = ref<Project["status"]>("active")
const newProjectType = ref('')
const newProjectPriority = ref('medium')
const newProjectStartDate = ref('')
const newProjectEndDate = ref('')
const newProjectTags = ref('')
const isDeleteModalOpen = ref(false)
const projectToDelete = ref<string | null>(null)
const isEditModalOpen = ref(false)
const projectToEdit = ref<Project | null>(null)
const editedProjectName = ref('')
const editedProjectDescription = ref('')
const editedProjectStatus = ref<Project["status"]>("active")
const isViewModalOpen = ref(false)
const currentProject = ref<Project | null>(null)
const openMenuId = ref<string | null>(null)

const filteredProjects = computed(() => {
  return projects.value.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesStatus = statusFilter.value === "all" || project.status === statusFilter.value
    return matchesSearch && matchesStatus
  })
})

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    case "inactive":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    case "maintenance":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case "active":
      return "运行中"
    case "inactive":
      return "已停用"
    case "maintenance":
      return "维护中"
    default:
      return "未知"
  }
}

const openCreateModal = () => {
  newProjectName.value = ''
  newProjectDescription.value = ''
  newProjectOwner.value = ''
  newProjectStatus.value = 'active'
  newProjectType.value = ''
  newProjectPriority.value = 'medium'
  newProjectStartDate.value = ''
  newProjectEndDate.value = ''
  newProjectTags.value = ''
  isCreateModalOpen.value = true
}

const closeCreateModal = () => {
  isCreateModalOpen.value = false
}

const saveNewProject = () => {
  // 表单验证
  if (!newProjectName.value.trim()) {
    alert('请输入项目名称')
    return
  }
  
  if (!newProjectOwner.value.trim()) {
    alert('请选择项目负责人')
    return
  }
  
  if (!newProjectType.value.trim()) {
    alert('请选择项目类型')
    return
  }
  
  // 创建项目
  addProject({
    name: newProjectName.value,
    description: newProjectDescription.value,
    status: newProjectStatus.value
  })
  
  closeCreateModal()
}

const handleCreateProject = () => {
  openCreateModal()
}

const openViewModal = (project: Project) => {
  currentProject.value = project
  isViewModalOpen.value = true
}

const closeViewModal = () => {
  isViewModalOpen.value = false
  currentProject.value = null
}

const handleViewProject = (project: Project) => {
  openViewModal(project)
}

const openEditModal = (project: Project) => {
  projectToEdit.value = project
  editedProjectName.value = project.name
  editedProjectDescription.value = project.description
  editedProjectStatus.value = project.status
  isEditModalOpen.value = true
}

const closeEditModal = () => {
  isEditModalOpen.value = false
  projectToEdit.value = null
}

const saveEditedProject = () => {
  if (projectToEdit.value && editedProjectName.value.trim()) {
    updateProject(projectToEdit.value.id, {
      name: editedProjectName.value,
      description: editedProjectDescription.value,
      status: editedProjectStatus.value,
    })
    closeEditModal()
  }
}

const handleEditProject = (projectId: string) => {
  const project = projects.value.find(p => p.id === projectId)
  if (project) {
    openEditModal(project)
  }
}

const handleToggleStatus = (projectId: string) => {
  const project = projects.value.find(p => p.id === projectId)
  if (project) {
    const nextStatus = project.status === "active" ? "inactive" : project.status === "inactive" ? "maintenance" : "active"
    updateProject(projectId, {
      status: nextStatus
    })
  }
}

const handleDuplicateProject = (projectId: string) => {
  const project = projects.value.find(p => p.id === projectId)
  if (project) {
    addProject({
      name: `${project.name}（副本）`,
      description: project.description,
      status: project.status,
    })
  }
}

const openDeleteModal = (projectId: string) => {
  projectToDelete.value = projectId
  isDeleteModalOpen.value = true
}

const closeDeleteModal = () => {
  isDeleteModalOpen.value = false
  projectToDelete.value = null
}

const confirmDeleteProject = () => {
  if (projectToDelete.value) {
    removeProject(projectToDelete.value)
  }
  closeDeleteModal()
}

const handleDeleteProject = (projectId: string) => {
  openDeleteModal(projectId)
}
</script>