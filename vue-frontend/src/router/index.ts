import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import Layout from '@/components/Layout.vue'
import Dashboard from '@/pages/Dashboard.vue'
import Projects from '@/pages/Projects.vue'
import ProxyConfig from '@/pages/ProxyConfig.vue'
import Memory from '@/pages/Memory.vue'
import SegmentationConfig from '@/pages/SegmentationConfig.vue'
import TokenManagement from '@/pages/TokenManagement.vue'
import Analytics from '@/pages/Analytics.vue'
import Settings from '@/pages/Settings.vue'
import ApiDocs from '@/pages/ApiDocs.vue'
import KnowledgeGraph from '@/pages/KnowledgeGraph.vue'
import TemporalEntities from '@/pages/TemporalEntities.vue'
import RelationInference from '@/pages/RelationInference.vue'
import MemorySynthesis from '@/pages/MemorySynthesis.vue'
import RAGKnowledgeSources from '@/pages/RAGKnowledgeSources.vue'
import FusionSearchConfig from '@/pages/FusionSearchConfig.vue'
import FusionSearchResults from '@/pages/FusionSearchResults.vue'
import TaskPlanning from '@/pages/TaskPlanning.vue'
import ToolManagement from '@/pages/ToolManagement.vue'
import Test from '@/pages/Test.vue'
import SessionDetail from '@/pages/SessionDetail.vue'
import AgentAnalytics from '@/pages/AgentAnalytics.vue'
import AgentManagement from '@/pages/AgentManagement.vue'
import MemoryDetail from '@/pages/MemoryDetail.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard
      },
      {
        path: 'projects',
        name: 'Projects',
        component: Projects
      },
      {
        path: 'proxy-config',
        name: 'ProxyConfig',
        component: ProxyConfig
      },
      {
        path: 'memory',
        name: 'Memory',
        component: Memory
      },
      {
        path: 'memory/:id',
        name: 'MemoryDetail',
        component: MemoryDetail
      },
      {
        path: 'segmentation-config',
        name: 'SegmentationConfig',
        component: SegmentationConfig
      },
      {
        path: 'token-management',
        name: 'TokenManagement',
        component: TokenManagement
      },
      {
        path: 'analytics',
        name: 'Analytics',
        component: Analytics
      },
      {
        path: 'settings',
        name: 'Settings',
        component: Settings
      },
      {
        path: 'api-docs',
        name: 'ApiDocs',
        component: ApiDocs
      },
      {
        path: 'knowledge-graph',
        name: 'KnowledgeGraph',
        component: KnowledgeGraph
      },
      {
        path: 'temporal-entities',
        name: 'TemporalEntities',
        component: TemporalEntities
      },
      {
        path: 'relation-inference',
        name: 'RelationInference',
        component: RelationInference
      },
      {
        path: 'memory-synthesis',
        name: 'MemorySynthesis',
        component: MemorySynthesis
      },
      {
        path: 'rag-knowledge-sources',
        name: 'RAGKnowledgeSources',
        component: RAGKnowledgeSources
      },
      {
        path: 'fusion-search-config',
        name: 'FusionSearchConfig',
        component: FusionSearchConfig
      },
      {
        path: 'fusion-search-results',
        name: 'FusionSearchResults',
        component: FusionSearchResults
      },
      {
        path: 'task-planning',
        name: 'TaskPlanning',
        component: TaskPlanning
      },
      {
        path: 'tool-management',
        name: 'ToolManagement',
        component: ToolManagement
      },
      {
        path: 'agent-management',
        name: 'AgentManagement',
        component: AgentManagement
      },
      {
        path: 'test',
        name: 'Test',
        component: Test
      },
      {
        path: 'session-detail/:id',
        name: 'SessionDetail',
        component: SessionDetail
      },
      {
        path: 'agent-analytics',
        name: 'AgentAnalytics',
        component: AgentAnalytics
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router