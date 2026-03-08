<template>
  <div class="p-6 space-y-6">
    <!-- 页面标题和项目选择 -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">关系推理</h1>
        <p class="mt-2 text-gray-600">
          智能推理和发现实体间的潜在关系
        </p>
      </div>
      <div class="flex items-center space-x-4">
        <select v-model="selectedProject" class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-48">
          <option value="all">所有项目</option>
          <option v-for="project in mockProjects" :key="project.id" :value="project.name">
            {{ project.name }}
          </option>
        </select>
        <button 
          @click="refreshData" 
          class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center"
        >
          <RefreshCw class="h-4 w-4 mr-2" />
          刷新数据
        </button>
        <button 
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
        >
          <Play class="h-4 w-4 mr-2" />
          新建推理任务
        </button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-5 gap-6">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <Brain class="h-8 w-8 text-blue-600" />
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">推理关系</p>
            <p class="text-2xl font-bold">{{ stats.totalRelations }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <TrendingUp class="h-8 w-8 text-green-600" />
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">高置信度</p>
            <p class="text-2xl font-bold">{{ stats.highConfidenceRelations }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <CheckCircle class="h-8 w-8 text-emerald-600" />
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">已确认</p>
            <p class="text-2xl font-bold">{{ stats.confirmedRelations }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <Activity class="h-8 w-8 text-orange-600" />
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">运行中任务</p>
            <p class="text-2xl font-bold">{{ stats.activeJobs }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <BarChart3 class="h-8 w-8 text-purple-600" />
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">平均置信度</p>
            <p class="text-2xl font-bold">{{ stats.avgConfidence }}%</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div class="md:col-span-1">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              v-model="searchQuery"
              placeholder="搜索关系..."
              class="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <select v-model="selectedConfidenceRange" class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">所有置信度</option>
          <option value="high">高 (≥80%)</option>
          <option value="medium">中 (60-80%)</option>
          <option value="low">低 (&lt;60%)</option>
        </select>
        
        <select v-model="selectedValidationStatus" class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">所有状态</option>
          <option value="confirmed">已确认</option>
          <option value="pending">待验证</option>
          <option value="needs_review">需要审查</option>
          <option value="rejected">已拒绝</option>
        </select>
        
        <select v-model="selectedJobStatus" class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">所有任务</option>
          <option value="running">运行中</option>
          <option value="completed">已完成</option>
          <option value="pending">待执行</option>
          <option value="failed">失败</option>
        </select>
        
        <button 
          class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center w-full"
        >
          <Filter class="h-4 w-4 mr-2" />
          高级筛选
        </button>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div>
      <!-- 标签页 -->
      <div class="flex border-b mb-6">
        <button 
          v-for="tab in tabs" 
          :key="tab.value" 
          :class="[
            'px-5 py-2 mr-2 font-medium',
            activeTab === tab.value 
              ? 'border-b-2 border-blue-600 text-blue-600' 
              : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700'
          ]"
          @click="activeTab = tab.value"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- 关系列表视图 -->
      <div v-if="activeTab === 'relations'" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 关系列表 -->
        <div class="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 class="text-lg font-semibold mb-4 flex items-center">
            <Brain class="h-5 w-5 mr-2" />
            推理关系列表
          </h2>
          <div class="space-y-4">
            <div 
              v-for="relation in filteredRelations" 
              :key="relation.id" 
              :class="[
                'border rounded-lg p-4 cursor-pointer transition-colors',
                selectedRelation?.id === relation.id 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'hover:bg-gray-50'
              ]"
              @click="selectRelation(relation)"
            >
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <div class="flex items-center space-x-2">
                    <h3 class="font-semibold">{{ relation.sourceEntity }} → {{ relation.targetEntity }}</h3>
                    <span class="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">{{ relation.relationType }}</span>
                    <span class="px-2 py-1 border border-gray-300 text-gray-600 rounded text-xs">{{ relation.project }}</span>
                  </div>
                  <div class="mt-2 text-sm text-gray-500">
                    <div class="flex items-center space-x-4">
                      <span class="flex items-center">
                        <BarChart3 class="w-3 h-3 mr-1" />
                        置信度: {{ (relation.confidence * 100).toFixed(1) }}%
                      </span>
                      <span class="flex items-center">
                        <Zap class="w-3 h-3 mr-1" />
                        方法: {{ relation.inferenceMethod }}
                      </span>
                      <span :class="[
                        'flex items-center',
                        getValidationStatusColor(relation.metadata.validationStatus)
                      ]">
                        <CheckCircle class="w-3 h-3 mr-1" />
                        {{ relation.metadata.validationStatus }}
                      </span>
                    </div>
                  </div>
                  <div class="mt-2">
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        class="bg-blue-600 h-2 rounded-full" 
                        :style="{ width: `${relation.confidence * 100}%` }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 关系详情 -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 class="text-lg font-semibold mb-4 flex items-center">
            <Brain class="h-5 w-5 mr-2" />
            {{ selectedRelation ? '关系详情' : '选择关系查看详情' }}
          </h2>
          
          <div v-if="selectedRelation" class="space-y-4">
            <!-- 关系基本信息 -->
            <div class="border-b pb-4">
              <h3 class="font-semibold text-lg">
                {{ selectedRelation.sourceEntity }} → {{ selectedRelation.targetEntity }}
              </h3>
              <div class="mt-2 space-y-1 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-500">关系类型:</span>
                  <span>{{ selectedRelation.relationType }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500">项目:</span>
                  <span>{{ selectedRelation.project }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500">置信度:</span>
                  <span>{{ (selectedRelation.confidence * 100).toFixed(1) }}%</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500">推理方法:</span>
                  <span>{{ selectedRelation.inferenceMethod }}</span>
                </div>
              </div>
            </div>

            <!-- 证据信息 -->
            <div class="border-b pb-4">
              <h4 class="font-medium mb-2">支持证据</h4>
              <div class="space-y-2">
                <div 
                  v-for="(evidence, index) in selectedRelation.evidence" 
                  :key="index"
                  class="flex items-start space-x-2 text-sm"
                >
                  <CheckCircle class="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>{{ evidence }}</span>
                </div>
              </div>
            </div>

            <!-- 元数据信息 -->
            <div>
              <h4 class="font-medium mb-2">元数据</h4>
              <div class="space-y-1 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-500">推理时间:</span>
                  <span>{{ formatDate(selectedRelation.metadata.inferredAt) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500">最后验证:</span>
                  <span>{{ formatDate(selectedRelation.metadata.lastValidated) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500">验证状态:</span>
                  <span :class="[
                    'px-2 py-1 border border-gray-300 rounded text-xs',
                    getValidationStatusColor(selectedRelation.metadata.validationStatus)
                  ]">
                    {{ selectedRelation.metadata.validationStatus }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500">关系强度:</span>
                  <span>{{ selectedRelation.metadata.strength }}</span>
                </div>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="pt-4 space-y-2">
              <button 
                class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
              >
                <CheckCircle class="h-4 w-4 mr-2" />
                确认关系
              </button>
              <button 
                class="w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center"
              >
                <AlertCircle class="h-4 w-4 mr-2" />
                需要审查
              </button>
            </div>
          </div>
          
          <div v-else class="text-center text-gray-500 py-8">
            <Brain class="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>点击左侧关系查看详细信息</p>
          </div>
        </div>
      </div>

      <!-- 推理任务视图 -->
      <div v-else-if="activeTab === 'jobs'" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-lg font-semibold mb-4 flex items-center">
          <Activity class="h-5 w-5 mr-2" />
          推理任务管理
        </h2>
        <div class="space-y-4">
          <div 
            v-for="job in filteredJobs" 
            :key="job.id" 
            class="border rounded-lg p-4"
          >
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <div class="flex items-center space-x-2">
                  <h3 class="font-semibold">{{ job.name }}</h3>
                  <span class="px-2 py-1 border border-gray-300 text-gray-600 rounded text-xs">{{ job.project }}</span>
                  <span 
                    :class="[
                      'px-2 py-1 border rounded text-xs',
                      getStatusColor(job.status)
                    ]"
                  >
                    {{ job.status }}
                  </span>
                </div>
                <div class="mt-2 text-sm text-gray-500">
                  <div class="flex items-center space-x-4">
                    <span class="flex items-center">
                      <Clock class="w-3 h-3 mr-1" />
                      开始: {{ formatDate(job.startTime) }}
                    </span>
                    <span class="flex items-center">
                      <TrendingUp class="w-3 h-3 mr-1" />
                      进度: {{ job.progress }}%
                    </span>
                    <span>优先级: {{ job.metadata.priority }}</span>
                  </div>
                </div>
                <div class="mt-3">
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      class="bg-blue-600 h-2 rounded-full" 
                      :style="{ width: `${job.progress}%` }"
                    ></div>
                  </div>
                </div>
                <div v-if="job.results.total_relations_found > 0" class="mt-3 grid grid-cols-4 gap-4 text-sm">
                  <div class="text-center">
                    <div class="font-medium">{{ job.results.total_relations_found }}</div>
                    <div class="text-gray-500">总关系</div>
                  </div>
                  <div class="text-center">
                    <div class="font-medium text-green-600">{{ job.results.high_confidence_relations }}</div>
                    <div class="text-gray-500">高置信度</div>
                  </div>
                  <div class="text-center">
                    <div class="font-medium text-yellow-600">{{ job.results.medium_confidence_relations }}</div>
                    <div class="text-gray-500">中置信度</div>
                  </div>
                  <div class="text-center">
                    <div class="font-medium text-red-600">{{ job.results.low_confidence_relations }}</div>
                    <div class="text-gray-500">低置信度</div>
                  </div>
                </div>
              </div>
              <div class="flex space-x-2">
                <button 
                  v-if="job.status === 'running'" 
                  class="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <Pause class="h-4 w-4" />
                </button>
                <button 
                  v-if="job.status === 'pending'" 
                  class="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <Play class="h-4 w-4" />
                </button>
                <button class="p-2 border border-gray-300 rounded-md hover:bg-gray-50">
                  <Settings class="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 分析报告视图 -->
      <div v-else-if="activeTab === 'analytics'" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- 关系类型分布 -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 class="text-lg font-semibold mb-4">关系类型分布</h2>
          <div class="space-y-4">
            <div 
              v-for="type in relationTypes" 
              :key="type"
              class="space-y-2"
            >
              <div class="flex justify-between text-sm">
                <span>{{ type }}</span>
                <span>{{ getRelationCountByType(type) }} ({{ getRelationPercentageByType(type) }}%)</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div 
                  class="bg-blue-600 h-2 rounded-full" 
                  :style="{ width: `${getRelationPercentageByType(type)}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 置信度分布 -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 class="text-lg font-semibold mb-4">置信度分布</h2>
          <div class="space-y-4">
            <div 
              v-for="confidenceType in confidenceTypes" 
              :key="confidenceType.label"
              class="space-y-2"
            >
              <div class="flex justify-between text-sm">
                <span>{{ confidenceType.label }}</span>
                <span>{{ getConfidenceCount(confidenceType.range) }} ({{ getConfidencePercentage(confidenceType.range) }}%)</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div 
                  class="h-2 rounded-full" 
                  :class="confidenceType.color"
                  :style="{ width: `${getConfidencePercentage(confidenceType.range)}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  Brain,
  Search,
  Filter,
  RefreshCw,
  Play,
  Pause,
  Settings,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Activity,
  Zap
} from 'lucide-vue-next'

// 定义接口
interface Project {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive" | "maintenance";
}

interface InferredRelation {
  id: string;
  sourceEntity: string;
  targetEntity: string;
  relationType: string;
  project: string;
  confidence: number;
  inferenceMethod: string;
  evidence: string[];
  metadata: {
    inferredAt: string;
    lastValidated: string;
    validationStatus: "confirmed" | "pending" | "needs_review" | "rejected";
    strength: "weak" | "medium" | "strong";
  };
}

interface InferenceJob {
  id: string;
  name: string;
  project: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  startTime: string;
  estimatedEndTime: string;
  config: {
    method: string;
    confidence_threshold: number;
    max_relations: number;
    include_temporal: boolean;
  };
  results: {
    total_relations_found: number;
    high_confidence_relations: number;
    medium_confidence_relations: number;
    low_confidence_relations: number;
  };
  metadata: {
    created_by: string;
    priority: "high" | "medium" | "low";
    resource_usage: "high" | "medium" | "low";
  };
}

interface ConfidenceType {
  label: string;
  range: (confidence: number) => boolean;
  color: string;
}

// 模拟数据
const mockProjects: Project[] = [
  { id: "1", name: "AI客服助手", description: "智能客服系统", status: "active" },
  { id: "2", name: "内容生成器", description: "AI内容创作工具", status: "active" },
  { id: "3", name: "数据分析平台", description: "企业数据分析", status: "maintenance" }
];

const mockInferredRelations: InferredRelation[] = [
  {
    id: "rel_001",
    sourceEntity: "user_001",
    targetEntity: "project_ai_assistant",
    relationType: "works_on",
    project: "AI客服助手",
    confidence: 0.92,
    inferenceMethod: "pattern_matching",
    evidence: [
      "用户在项目相关会议中频繁出现",
      "用户提交了多个项目相关的代码提交",
      "用户被分配到项目团队"
    ],
    metadata: {
      inferredAt: "2024-01-16T10:30:00Z",
      lastValidated: "2024-01-16T15:45:00Z",
      validationStatus: "confirmed",
      strength: "strong"
    }
  },
  {
    id: "rel_002",
    sourceEntity: "model_gpt4",
    targetEntity: "content_generation_task",
    relationType: "used_for",
    project: "内容生成器",
    confidence: 0.88,
    inferenceMethod: "usage_analysis",
    evidence: [
      "模型在内容生成任务中被调用",
      "生成质量指标显示高度相关性",
      "用户反馈确认模型效果"
    ],
    metadata: {
      inferredAt: "2024-01-15T14:20:00Z",
      lastValidated: "2024-01-15T16:30:00Z",
      validationStatus: "pending",
      strength: "medium"
    }
  },
  {
    id: "rel_003",
    sourceEntity: "dataset_customer_feedback",
    targetEntity: "sentiment_analysis",
    relationType: "input_for",
    project: "数据分析平台",
    confidence: 0.95,
    inferenceMethod: "data_flow_analysis",
    evidence: [
      "数据集作为情感分析的输入源",
      "数据处理管道显示直接连接",
      "分析结果与数据集内容高度匹配"
    ],
    metadata: {
      inferredAt: "2024-01-14T09:15:00Z",
      lastValidated: "2024-01-14T11:20:00Z",
      validationStatus: "confirmed",
      strength: "strong"
    }
  },
  {
    id: "rel_004",
    sourceEntity: "user_002",
    targetEntity: "user_001",
    relationType: "collaborates_with",
    project: "AI客服助手",
    confidence: 0.78,
    inferenceMethod: "interaction_analysis",
    evidence: [
      "频繁的邮件往来",
      "共同参与项目会议",
      "代码审查记录显示协作"
    ],
    metadata: {
      inferredAt: "2024-01-13T16:45:00Z",
      lastValidated: "2024-01-13T18:00:00Z",
      validationStatus: "needs_review",
      strength: "medium"
    }
  }
];

const mockInferenceJobs: InferenceJob[] = [
  {
    id: "job_001",
    name: "用户协作关系推理",
    project: "AI客服助手",
    status: "running",
    progress: 75,
    startTime: "2024-01-16T08:00:00Z",
    estimatedEndTime: "2024-01-16T12:00:00Z",
    config: {
      method: "graph_neural_network",
      confidence_threshold: 0.7,
      max_relations: 1000,
      include_temporal: true
    },
    results: {
      total_relations_found: 156,
      high_confidence_relations: 89,
      medium_confidence_relations: 45,
      low_confidence_relations: 22
    },
    metadata: {
      created_by: "system",
      priority: "high",
      resource_usage: "medium"
    }
  },
  {
    id: "job_002",
    name: "内容生成模型关系分析",
    project: "内容生成器",
    status: "completed",
    progress: 100,
    startTime: "2024-01-15T10:00:00Z",
    estimatedEndTime: "2024-01-15T14:00:00Z",
    config: {
      method: "semantic_similarity",
      confidence_threshold: 0.8,
      max_relations: 500,
      include_temporal: false
    },
    results: {
      total_relations_found: 234,
      high_confidence_relations: 178,
      medium_confidence_relations: 42,
      low_confidence_relations: 14
    },
    metadata: {
      created_by: "admin",
      priority: "medium",
      resource_usage: "low"
    }
  },
  {
    id: "job_003",
    name: "数据流关系挖掘",
    project: "数据分析平台",
    status: "pending",
    progress: 0,
    startTime: "2024-01-17T09:00:00Z",
    estimatedEndTime: "2024-01-17T15:00:00Z",
    config: {
      method: "data_lineage_analysis",
      confidence_threshold: 0.75,
      max_relations: 800,
      include_temporal: true
    },
    results: {
      total_relations_found: 0,
      high_confidence_relations: 0,
      medium_confidence_relations: 0,
      low_confidence_relations: 0
    },
    metadata: {
      created_by: "data_engineer",
      priority: "low",
      resource_usage: "high"
    }
  }
];

// 置信度类型
const confidenceTypes: ConfidenceType[] = [
  { label: "高置信度 (≥80%)", range: (confidence: number) => confidence >= 0.8, color: "bg-green-500" },
  { label: "中置信度 (60-80%)", range: (confidence: number) => confidence >= 0.6 && confidence < 0.8, color: "bg-yellow-500" },
  { label: "低置信度 (<60%)", range: (confidence: number) => confidence < 0.6, color: "bg-red-500" }
];

// 路由和响应式数据
const route = useRoute()
const activeTab = ref('relations')
const selectedProject = ref('all')
const searchQuery = ref('')
const selectedConfidenceRange = ref('all')
const selectedValidationStatus = ref('all')
const selectedJobStatus = ref('all')
const selectedRelation = ref<InferredRelation | null>(null)
const relations = ref<InferredRelation[]>(mockInferredRelations)
const inferenceJobs = ref<InferenceJob[]>(mockInferenceJobs)

// 从路由查询参数获取项目信息
onMounted(() => {
  if (route.query.project) {
    selectedProject.value = route.query.project as string
  }
})

// 标签页数据
const tabs = [
  { value: 'relations', label: '推理关系' },
  { value: 'jobs', label: '推理任务' },
  { value: 'analytics', label: '分析报告' }
]

// 根据项目筛选关系
const filteredRelations = computed(() => {
  return relations.value.filter(relation => {
    const projectMatch = selectedProject.value === "all" || relation.project === selectedProject.value;
    const searchMatch = searchQuery.value === "" || 
      relation.sourceEntity.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      relation.targetEntity.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      relation.relationType.toLowerCase().includes(searchQuery.value.toLowerCase());
    
    const confidenceMatch = selectedConfidenceRange.value === "all" || 
      (selectedConfidenceRange.value === "high" && relation.confidence >= 0.8) ||
      (selectedConfidenceRange.value === "medium" && relation.confidence >= 0.6 && relation.confidence < 0.8) ||
      (selectedConfidenceRange.value === "low" && relation.confidence < 0.6);
    
    const validationMatch = selectedValidationStatus.value === "all" || 
      relation.metadata.validationStatus === selectedValidationStatus.value;
    
    return projectMatch && searchMatch && confidenceMatch && validationMatch;
  });
});

// 根据项目筛选任务
const filteredJobs = computed(() => {
  return inferenceJobs.value.filter(job => 
    selectedProject.value === "all" || job.project === selectedProject.value
  ).filter(job =>
    selectedJobStatus.value === "all" || job.status === selectedJobStatus.value
  );
});

// 统计信息
const stats = computed(() => {
  return {
    totalRelations: filteredRelations.value.length,
    highConfidenceRelations: filteredRelations.value.filter(r => r.confidence >= 0.8).length,
    confirmedRelations: filteredRelations.value.filter(r => r.metadata.validationStatus === "confirmed").length,
    activeJobs: filteredJobs.value.filter(j => j.status === "running").length,
    avgConfidence: filteredRelations.value.length > 0 
      ? (filteredRelations.value.reduce((sum, r) => sum + r.confidence, 0) / filteredRelations.value.length * 100).toFixed(1)
      : "0"
  };
});

// 关系类型
const relationTypes = computed(() => {
  return [...new Set(relations.value.map(r => r.relationType))];
});

// 方法
const refreshData = () => {
  // 模拟数据刷新
  console.log('刷新数据');
};

const selectRelation = (relation: InferredRelation) => {
  selectedRelation.value = relation;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

const getValidationStatusColor = (status: string) => {
  switch (status) {
    case "confirmed": return "text-green-600";
    case "pending": return "text-yellow-600";
    case "needs_review": return "text-orange-600";
    case "rejected": return "text-red-600";
    default: return "text-gray-600";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "running": return "text-blue-600 border-blue-200 bg-blue-50";
    case "completed": return "text-green-600 border-green-200 bg-green-50";
    case "pending": return "text-yellow-600 border-yellow-200 bg-yellow-50";
    case "failed": return "text-red-600 border-red-200 bg-red-50";
    default: return "text-gray-600 border-gray-200 bg-gray-50";
  }
};

const getRelationCountByType = (type: string) => {
  return filteredRelations.value.filter(r => r.relationType === type).length;
};

const getRelationPercentageByType = (type: string) => {
  if (filteredRelations.value.length === 0) return "0";
  const count = getRelationCountByType(type);
  return ((count / filteredRelations.value.length) * 100).toFixed(1);
};

const getConfidenceCount = (range: (confidence: number) => boolean) => {
  return filteredRelations.value.filter(r => range(r.confidence)).length;
};

const getConfidencePercentage = (range: (confidence: number) => boolean) => {
  if (filteredRelations.value.length === 0) return "0";
  const count = getConfidenceCount(range);
  return ((count / filteredRelations.value.length) * 100).toFixed(1);
};
</script>