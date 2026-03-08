<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          工具管理
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          管理和配置系统中的工具
        </p>
      </div>
      <button
        @click="openCreateDialog"
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-150 flex items-center"
      >
        <Plus class="w-4 h-4 mr-1" />
        创建工具
      </button>
    </div>

    <!-- 搜索和筛选 -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
      <div class="flex items-center space-x-4">
        <div class="relative w-full max-w-md">
          <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索工具..."
            class="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <select
          v-model="statusFilter"
          class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="all">全部状态</option>
          <option value="active">活跃</option>
          <option value="inactive">非活跃</option>
        </select>
      </div>
    </div>

    <!-- 工具列表 -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-750">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                ID
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                名称
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                描述
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                类型
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                状态
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                创建时间
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="tool in filteredTools" :key="tool.id" class="hover:bg-gray-50 dark:hover:bg-gray-750">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ tool.id }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <Wrench class="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ tool.name }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                {{ tool.description || '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <Badge class="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                  {{ tool.type }}
                </Badge>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <Badge :class="tool.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'">
                  {{ tool.status === 'active' ? '活跃' : '非活跃' }}
                </Badge>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(tool.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end space-x-2">
                  <button
                    @click="toggleToolStatus(tool)"
                    :class="[
                      'px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-150',
                      tool.status === 'active' 
                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:hover:bg-yellow-800' 
                        : 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800'
                    ]"
                  >
                    {{ tool.status === 'active' ? '停用' : '激活' }}
                  </button>
                  <button
                    @click="openEditDialog(tool)"
                    class="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors duration-150 text-sm font-medium dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
                  >
                    编辑
                  </button>
                  <button
                    @click="openDeleteDialog(tool)"
                    class="px-3 py-1.5 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors duration-150 text-sm font-medium dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
                  >
                    删除
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- 空状态 -->
      <div v-if="filteredTools.length === 0" class="px-6 py-12 text-center">
        <Wrench class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          没有找到工具
        </h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          点击"创建工具"按钮开始添加工具
        </p>
      </div>
    </div>

    <!-- 创建/编辑工具对话框 -->
    <Dialog :is-open="isDialogOpen" @close="closeDialog">
      <template #title>
        {{ isEditing ? '编辑工具' : '创建工具' }}
      </template>
      <template #content>
        <form @submit.prevent="saveTool">
          <div class="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <!-- 基本信息 -->
            <div>
              <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">基本信息</h3>
              <div class="space-y-3">
                <div>
                  <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    名称 *
                  </label>
                  <input
                    type="text"
                    id="name"
                    v-model="formData.name"
                    required
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="工具名称"
                  />
                </div>
                <div>
                  <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    描述
                  </label>
                  <textarea
                    id="description"
                    v-model="formData.description"
                    rows="3"
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="工具描述"
                  ></textarea>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label for="type" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      工具类型 *
                    </label>
                    <select
                      id="type"
                      v-model="formData.type"
                      required
                      class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="database">数据库操作</option>
                      <option value="api">API调用</option>
                      <option value="file">文件操作</option>
                      <option value="computation">计算处理</option>
                      <option value="notification">通知推送</option>
                      <option value="ai">AI辅助</option>
                      <option value="custom">自定义</option>
                    </select>
                  </div>
                  <div>
                    <label for="category" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      分类
                    </label>
                    <select
                      id="category"
                      v-model="formData.category"
                      class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="data">数据处理</option>
                      <option value="business">业务逻辑</option>
                      <option value="utility">实用工具</option>
                      <option value="integration">系统集成</option>
                      <option value="development">开发工具</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <!-- 参数配置 -->
            <div>
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">参数配置</h3>
                <button
                  type="button"
                  @click="openParamDialog"
                  class="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-150 text-xs flex items-center"
                >
                  <Plus class="w-3 h-3 mr-1" />
                  添加参数
                </button>
              </div>
              <div class="space-y-2">
                <div v-if="formData.parameters.length === 0" class="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
                  尚未添加任何参数
                </div>
                <div 
                  v-for="(param, index) in formData.parameters" 
                  :key="index"
                  class="p-3 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-750"
                >
                  <div class="flex items-start justify-between">
                    <div>
                      <div class="flex items-center space-x-2">
                        <span class="font-medium text-sm text-gray-900 dark:text-white">{{ param.name }}</span>
                        <Badge :class="param.required ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'">
                          {{ param.required ? '必填' : '可选' }}
                        </Badge>
                        <Badge class="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                          {{ param.type }}
                        </Badge>
                      </div>
                      <div class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {{ param.description || '无描述' }}
                      </div>
                      <div v-if="param.defaultValue" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        默认值: <span class="font-mono">{{ String(param.defaultValue) }}</span>
                      </div>
                    </div>
                    <div class="flex space-x-1">
                      <button
                        type="button"
                        @click="editParam(index)"
                        class="p-1.5 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-md"
                        title="编辑参数"
                      >
                        <Edit class="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        @click="deleteParam(index)"
                        class="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-md"
                        title="删除参数"
                      >
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 输出配置 -->
            <div>
              <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">输出配置</h3>
              <div>
                <label for="outputSchema" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  输出Schema (JSON)
                </label>
                <textarea
                  id="outputSchema"
                  v-model="outputSchemaText"
                  rows="4"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
                  placeholder='{"type": "object", "properties": {"result": {"type": "string"}}}'
                ></textarea>
              </div>
            </div>

            <!-- 执行配置 -->
            <div>
              <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">执行配置</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label for="executionTimeout" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    执行超时 (秒)
                  </label>
                  <input
                    type="number"
                    id="executionTimeout"
                    v-model="formData.executionTimeout"
                    min="1"
                    max="3600"
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="30"
                  />
                </div>
                <div>
                  <label for="retryPolicy" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    重试策略
                  </label>
                  <select
                    id="retryPolicy"
                    v-model="formData.retryPolicy"
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="none">不重试</option>
                    <option value="retry_once">重试一次</option>
                    <option value="retry_multiple">多次重试</option>
                  </select>
                </div>
                <div>
                  <label for="environment" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    运行环境
                  </label>
                  <select
                    id="environment"
                    v-model="formData.environment"
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="production">生产环境</option>
                    <option value="staging">测试环境</option>
                    <option value="development">开发环境</option>
                  </select>
                </div>
                <div>
                  <label for="logLevel" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    日志级别
                  </label>
                  <select
                    id="logLevel"
                    v-model="formData.logLevel"
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="error">错误</option>
                    <option value="warn">警告</option>
                    <option value="info">信息</option>
                    <option value="debug">调试</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- 权限配置 -->
            <div>
              <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">权限配置</h3>
              <div class="space-y-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    允许访问的角色
                  </label>
                  <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div class="flex items-center">
                      <input
                        type="checkbox"
                        id="role-admin"
                        value="admin"
                        v-model="formData.permissions.roles"
                        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label for="role-admin" class="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        管理员
                      </label>
                    </div>
                    <div class="flex items-center">
                      <input
                        type="checkbox"
                        id="role-developer"
                        value="developer"
                        v-model="formData.permissions.roles"
                        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label for="role-developer" class="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        开发人员
                      </label>
                    </div>
                    <div class="flex items-center">
                      <input
                        type="checkbox"
                        id="role-user"
                        value="user"
                        v-model="formData.permissions.roles"
                        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label for="role-user" class="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        普通用户
                      </label>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <!-- 状态设置 -->
            <div>
              <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">状态设置</h3>
              <div>
                <label for="status" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  状态
                </label>
                <select
                  id="status"
                  v-model="formData.status"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="active">活跃</option>
                  <option value="inactive">非活跃</option>
                </select>
              </div>
            </div>
          </div>
        </form>
      </template>
      <template #footer>
        <button
          type="button"
          @click="closeDialog"
          class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-150"
        >
          取消
        </button>
        <button
          type="button"
          @click="saveTool"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-150"
        >
          {{ isEditing ? '保存' : '创建' }}
        </button>
      </template>
    </Dialog>

    <!-- 参数编辑对话框 -->
    <Dialog :is-open="isParamDialogOpen" @close="closeParamDialog">
      <template #title>
        {{ editingParamIndex !== null ? '编辑参数' : '添加参数' }}
      </template>
      <template #content>
        <form @submit.prevent="saveParam">
          <div class="space-y-3">
            <div>
              <label for="param-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                参数名称 *
              </label>
              <input
                type="text"
                id="param-name"
                v-model="paramFormData.name"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="参数名称"
              />
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label for="param-type" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  参数类型 *
                </label>
                <select
                  id="param-type"
                  v-model="paramFormData.type"
                  required
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="string">字符串</option>
                  <option value="number">数字</option>
                  <option value="boolean">布尔值</option>
                  <option value="array">数组</option>
                  <option value="object">对象</option>
                  <option value="date">日期</option>
                </select>
              </div>
              <div class="flex items-center mt-6">
                <input
                  type="checkbox"
                  id="param-required"
                  v-model="paramFormData.required"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label for="param-required" class="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  必需参数
                </label>
              </div>
            </div>
            <div>
              <label for="param-description" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                参数描述
              </label>
              <textarea
                id="param-description"
                v-model="paramFormData.description"
                rows="2"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="参数描述"
              ></textarea>
            </div>
            <div>
              <label for="param-default" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                默认值
              </label>
              <input
                type="text"
                id="param-default"
                v-model="paramFormData.defaultValue"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="默认值"
              />
            </div>
            <div>
              <label for="param-validation" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                验证规则
              </label>
              <input
                type="text"
                id="param-validation"
                v-model="paramFormData.validation"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white font-mono text-xs"
                placeholder="例如: ^[a-zA-Z0-9]+$"
              />
            </div>
          </div>
        </form>
      </template>
      <template #footer>
        <button
          @click="closeParamDialog"
          class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-150"
        >
          取消
        </button>
        <button
          @click="saveParam"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-150"
        >
          {{ editingParamIndex !== null ? '保存修改' : '添加参数' }}
        </button>
      </template>
    </Dialog>

    <!-- 删除确认对话框 -->
    <Dialog :is-open="isDeleteDialogOpen" @close="closeDeleteDialog">
      <template #title>
        确认删除
      </template>
      <template #content>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          你确定要删除工具 <span class="font-medium text-gray-900 dark:text-white">{{ selectedToolForDelete?.name }}</span> 吗？
          此操作不可撤销。
        </p>
      </template>
      <template #footer>
        <button
          @click="closeDeleteDialog"
          class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-150"
        >
          取消
        </button>
        <button
          @click="deleteTool"
          class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-150"
        >
          删除
        </button>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Wrench, Plus, Search, Edit, Trash2 } from 'lucide-vue-next'
import { Tool, toolsApi } from '@/lib/api'
import Badge from '@/components/ui/Badge.vue'
import Dialog from '@/components/ui/Dialog.vue'

// 搜索和筛选
const searchQuery = ref('')
const statusFilter = ref('all')

// 对话框状态
const isDialogOpen = ref(false)
const isDeleteDialogOpen = ref(false)
const isEditing = ref(false)

// 参数定义接口
interface Parameter {
  name: string
  type: string
  required: boolean
  description?: string
  defaultValue?: any
  validation?: string
}

// 表单数据
const formData = ref({
  name: '',
  description: '',
  type: '',
  category: 'data',
  parameters: [] as Parameter[],
  outputSchema: {} as Record<string, any>,
  executionTimeout: 30,
  retryPolicy: 'none' as 'none' | 'retry_once' | 'retry_multiple',
  environment: 'production',
  permissions: {
    roles: [] as string[],
    agents: [] as string[]
  },
  logLevel: 'info' as 'error' | 'warn' | 'info' | 'debug',
  status: 'active' as 'active' | 'inactive'
})

// 输出Schema文本，用于JSON编辑
const outputSchemaText = ref('')

// 当前编辑的参数索引
const editingParamIndex = ref<number | null>(null)

// 单个参数表单数据
const paramFormData = ref<Parameter>({
  name: '',
  type: 'string',
  required: false,
  description: '',
  defaultValue: '',
  validation: ''
})

// 参数编辑对话框
const isParamDialogOpen = ref(false)

// 选中的工具
const selectedToolForDelete = ref<Tool | null>(null)
const selectedToolForEdit = ref<Tool | null>(null)

// 模拟工具数据
const tools = ref<Tool[]>([
  {
    id: 'tool-db-001',
    name: '数据库查询工具',
    description: '从数据库中查询和检索数据',
    type: 'database',
    category: 'data',
    parameters: [
      {
        name: 'query',
        type: 'string',
        required: true,
        description: 'SQL查询语句',
        defaultValue: ''
      },
      {
        name: 'database',
        type: 'string',
        required: true,
        description: '目标数据库名称',
        defaultValue: ''
      },
      {
        name: 'collection',
        type: 'string',
        required: false,
        description: '目标集合或表名',
        defaultValue: ''
      }
    ],
    outputSchema: {
      type: 'object',
      properties: {
        results: { type: 'array' },
        count: { type: 'number' }
      }
    },
    executionTimeout: 60,
    retryPolicy: 'none',
    environment: 'production',
    permissions: {
      roles: ['admin', 'developer'],
      agents: []
    },
    logLevel: 'info',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tool-data-clean-001',
    name: '数据清洗工具',
    description: '清洗和预处理数据',
    type: 'file',
    category: 'data',
    parameters: [
      {
        name: 'data',
        type: 'array',
        required: true,
        description: '待清洗的数据数组',
        defaultValue: []
      },
      {
        name: 'rules',
        type: 'object',
        required: false,
        description: '清洗规则配置',
        defaultValue: {}
      }
    ],
    outputSchema: {
      type: 'object',
      properties: {
        cleanedData: { type: 'array' },
        removedRecords: { type: 'number' }
      }
    },
    executionTimeout: 30,
    retryPolicy: 'retry_once',
    environment: 'staging',
    permissions: {
      roles: ['admin', 'developer'],
      agents: []
    },
    logLevel: 'info',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tool-report-001',
    name: '报告生成工具',
    description: '生成数据分析报告',
    type: 'api',
    category: 'business',
    parameters: [
      {
        name: 'data',
        type: 'object',
        required: true,
        description: '报告数据',
        defaultValue: {}
      },
      {
        name: 'format',
        type: 'string',
        required: false,
        description: '报告格式',
        defaultValue: 'pdf',
        validation: '^(pdf|excel|html)$'
      },
      {
        name: 'template',
        type: 'string',
        required: false,
        description: '报告模板',
        defaultValue: 'default'
      }
    ],
    outputSchema: {
      type: 'object',
      properties: {
        reportUrl: { type: 'string' },
        status: { type: 'string' }
      }
    },
    executionTimeout: 120,
    retryPolicy: 'retry_multiple',
    environment: 'production',
    permissions: {
      roles: ['admin', 'developer', 'user'],
      agents: []
    },
    logLevel: 'warn',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tool-email-001',
    name: '邮件发送工具',
    description: '发送电子邮件',
    type: 'notification',
    category: 'utility',
    parameters: [
      {
        name: 'to',
        type: 'string',
        required: true,
        description: '收件人邮箱',
        defaultValue: '',
        validation: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$'
      },
      {
        name: 'subject',
        type: 'string',
        required: true,
        description: '邮件主题',
        defaultValue: ''
      },
      {
        name: 'body',
        type: 'string',
        required: true,
        description: '邮件正文',
        defaultValue: ''
      }
    ],
    outputSchema: {
      type: 'object',
      properties: {
        messageId: { type: 'string' },
        status: { type: 'string' }
      }
    },
    executionTimeout: 15,
    retryPolicy: 'retry_once',
    environment: 'production',
    permissions: {
      roles: ['admin', 'developer'],
      agents: []
    },
    logLevel: 'debug',
    status: 'inactive',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tool-text-gen-001',
    name: '文本生成工具',
    description: '生成各种类型的文本',
    type: 'ai',
    category: 'business',
    parameters: [
      {
        name: 'prompt',
        type: 'string',
        required: true,
        description: '生成提示',
        defaultValue: ''
      },
      {
        name: 'model',
        type: 'string',
        required: false,
        description: 'AI模型名称',
        defaultValue: 'gpt-3.5-turbo'
      },
      {
        name: 'temperature',
        type: 'number',
        required: false,
        description: '生成温度',
        defaultValue: 0.7,
        validation: '^([0-9]|1)(\\.[0-9])?$'
      }
    ],
    outputSchema: {
      type: 'object',
      properties: {
        generatedText: { type: 'string' },
        tokensUsed: { type: 'number' }
      }
    },
    executionTimeout: 60,
    retryPolicy: 'none',
    environment: 'production',
    permissions: {
      roles: ['admin', 'developer', 'user'],
      agents: []
    },
    logLevel: 'info',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
])

// 过滤后的工具列表
const filteredTools = computed(() => {
  return tools.value.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                         tool.description?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         tool.id.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         tool.type.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesStatus = statusFilter.value === 'all' || tool.status === statusFilter.value
    return matchesSearch && matchesStatus
  })
})

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString()
}

// 打开创建对话框
const openCreateDialog = () => {
  isEditing.value = false
  formData.value = {
    name: '',
    description: '',
    type: '',
    category: 'data',
    parameters: [] as Parameter[],
    outputSchema: {} as Record<string, any>,
    executionTimeout: 30,
    retryPolicy: 'none',
    environment: 'production',
    permissions: {
      roles: [] as string[],
      agents: [] as string[]
    },
    logLevel: 'info',
    status: 'active'
  }
  outputSchemaText.value = JSON.stringify(formData.value.outputSchema, null, 2)
  isDialogOpen.value = true
}

// 打开编辑对话框
const openEditDialog = (tool: Tool) => {
  isEditing.value = true
  selectedToolForEdit.value = tool
  formData.value = {
    name: tool.name,
    description: tool.description || '',
    type: tool.type,
    category: tool.category || 'data',
    parameters: [...tool.parameters] as Parameter[],
    outputSchema: { ...tool.outputSchema } as Record<string, any>,
    executionTimeout: tool.executionTimeout || 30,
    retryPolicy: (tool.retryPolicy || 'none') as 'none' | 'retry_once' | 'retry_multiple',
    environment: tool.environment || 'production',
    permissions: {
      roles: [...(tool.permissions?.roles || [])] as string[],
      agents: [...(tool.permissions?.agents || [])] as string[]
    },
    logLevel: (tool.logLevel || 'info') as 'error' | 'warn' | 'info' | 'debug',
    status: tool.status
  }
  outputSchemaText.value = JSON.stringify(tool.outputSchema, null, 2)
  isDialogOpen.value = true
}

// 打开删除对话框
const openDeleteDialog = (tool: Tool) => {
  selectedToolForDelete.value = tool
  isDeleteDialogOpen.value = true
}

// 关闭对话框
const closeDialog = () => {
  isDialogOpen.value = false
  selectedToolForEdit.value = null
}

// 关闭删除对话框
const closeDeleteDialog = () => {
  isDeleteDialogOpen.value = false
  selectedToolForDelete.value = null
}

// 保存工具
const saveTool = () => {
  // 解析输出Schema
  try {
    if (outputSchemaText.value.trim()) {
      formData.value.outputSchema = JSON.parse(outputSchemaText.value)
    } else {
      formData.value.outputSchema = {}
    }
  } catch (error) {
    alert('输出Schema格式错误，请输入有效的JSON')
    return
  }

  if (isEditing.value && selectedToolForEdit.value) {
    // 更新工具
    const updatedTool = {
      ...selectedToolForEdit.value,
      ...formData.value,
      updatedAt: new Date().toISOString()
    }
    const index = tools.value.findIndex(t => t.id === selectedToolForEdit.value?.id)
    if (index !== -1) {
      tools.value[index] = updatedTool
    }
    // 实际项目中这里会调用API更新工具
    // await toolsApi.update(selectedToolForEdit.value.id, formData.value)
  } else {
    // 创建新工具
    const newTool: Tool = {
      id: `tool-${Date.now().toString().slice(-6)}`,
      ...formData.value,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    tools.value.unshift(newTool)
    // 实际项目中这里会调用API创建工具
    // await toolsApi.create(formData.value)
  }
  closeDialog()
}

// 删除工具
const deleteTool = () => {
  if (selectedToolForDelete.value) {
    const index = tools.value.findIndex(t => t.id === selectedToolForDelete.value?.id)
    if (index !== -1) {
      tools.value.splice(index, 1)
    }
    // 实际项目中这里会调用API删除工具
    // await toolsApi.delete(selectedToolForDelete.value.id)
  }
  closeDeleteDialog()
}

// 切换工具状态
const toggleToolStatus = (tool: Tool) => {
  const newStatus = tool.status === 'active' ? 'inactive' : 'active'
  const updatedTool = {
    ...tool,
    status: newStatus,
    updatedAt: new Date().toISOString()
  }
  const index = tools.value.findIndex(t => t.id === tool.id)
  if (index !== -1) {
    tools.value[index] = updatedTool
  }
  // 实际项目中这里会调用API更新工具状态
  // await toolsApi.updateStatus(tool.id, newStatus)
}

// 打开参数对话框
const openParamDialog = () => {
  editingParamIndex.value = null
  paramFormData.value = {
    name: '',
    type: 'string',
    required: false,
    description: '',
    defaultValue: '',
    validation: ''
  }
  isParamDialogOpen.value = true
}

// 编辑参数
const editParam = (index: number) => {
  editingParamIndex.value = index
  const param = formData.value.parameters[index]
  paramFormData.value = {
    name: param.name,
    type: param.type,
    required: param.required,
    description: param.description || '',
    defaultValue: param.defaultValue || '',
    validation: param.validation || ''
  }
  isParamDialogOpen.value = true
}

// 删除参数
const deleteParam = (index: number) => {
  formData.value.parameters.splice(index, 1)
}

// 保存参数
const saveParam = () => {
  if (editingParamIndex.value !== null) {
    // 更新现有参数
    formData.value.parameters[editingParamIndex.value] = {
      ...paramFormData.value
    }
  } else {
    // 添加新参数
    formData.value.parameters.push({
      ...paramFormData.value
    })
  }
  closeParamDialog()
}

// 关闭参数对话框
const closeParamDialog = () => {
  isParamDialogOpen.value = false
  editingParamIndex.value = null
}

// 组件挂载时加载数据
onMounted(() => {
  // 实际项目中这里会调用API获取工具列表
  // const response = await toolsApi.getAll()
  // tools.value = response.data
})
</script>