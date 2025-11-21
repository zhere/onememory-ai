import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Merge, 
  Brain, 
  Clock, 
  Search, 
  Filter,
  RefreshCw,
  Play,
  Settings,
  Eye,
  TrendingUp,
  Users,
  MessageSquare,
  Zap,
  Database,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { getApiClient } from '@/lib/api';
import KnowledgeGraphBreadcrumb from '@/components/KnowledgeGraphBreadcrumb';
import { useKnowledgeGraphState } from '@/hooks/useKnowledgeGraphState';

interface MemorySynthesis {
  id: string;
  project: string;
  sessionIds: string[];
  synthesizedMemories: {
    id: string;
    content: string;
    confidence: number;
    sources: string[];
    temporalContext: {
      startTime: string;
      endTime: string;
      duration: number;
    };
  }[];
  patterns: {
    id: string;
    type: string;
    description: string;
    frequency: number;
    significance: number;
  }[];
  insights: {
    id: string;
    category: string;
    description: string;
    confidence: number;
    impact: number;
  }[];
  metadata: {
    createdAt: string;
    lastUpdated: string;
    totalSessions: number;
    totalMemories: number;
    synthesisMethod: string;
  };
}

interface SynthesisJob {
  id: string;
  name: string;
  project: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  startTime: string;
  endTime?: string;
  parameters: {
    sessionIds: string[];
    timeRange: {
      start: string;
      end: string;
    };
    synthesisMethod: string;
    minConfidence: number;
  };
  results?: {
    synthesizedMemories: number;
    discoveredPatterns: number;
    generatedInsights: number;
  };
}

interface SynthesisStats {
  totalSyntheses: number;
  totalMemories: number;
  totalPatterns: number;
  totalInsights: number;
  averageConfidence: number;
  synthesisMethodDistribution: Record<string, number>;
}

interface Project {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive" | "maintenance";
}

interface RAGKnowledgeSource {
  id: string;
  name: string;
  type: 'elasticsearch' | 'chroma' | 'weaviate' | 'local_files' | 'database' | 'api';
  status: 'connected' | 'disconnected' | 'error';
  config: {
    url?: string;
    apiKey?: string;
    index?: string;
    collection?: string;
    database?: string;
    table?: string;
    [key: string]: any;
  };
  metadata: {
    createdAt: string;
    lastUpdated: string;
    lastSync?: string;
    documentCount?: number;
    errorMessage?: string;
  };
}

// 项目数据
const mockProjects: Project[] = [
  { id: "1", name: "AI客服助手", description: "智能客服系统", status: "active" },
  { id: "2", name: "内容生成器", description: "AI内容创作工具", status: "active" },
  { id: "3", name: "数据分析平台", description: "企业数据分析", status: "maintenance" }
];

export default function MemorySynthesis() {
  // 假数据 - 合成任务
  const mockSynthesisJobs: SynthesisJob[] = [
    {
      id: 'synthesis_job_1',
      name: '客服对话记忆合成',
      project: 'AI客服助手',
      status: 'completed',
      progress: 100,
      startTime: new Date(Date.now() - 3600000).toISOString(),
      endTime: new Date(Date.now() - 3000000).toISOString(),
      parameters: {
        sessionIds: ['session-1', 'session-2', 'session-3'],
        timeRange: {
          start: new Date(Date.now() - 86400000 * 7).toISOString(),
          end: new Date().toISOString()
        },
        synthesisMethod: 'temporal_clustering',
        minConfidence: 0.8
      },
      results: {
        synthesizedMemories: 24,
        discoveredPatterns: 8,
        generatedInsights: 12
      }
    },
    {
      id: 'synthesis_job_2',
      name: '内容生成模式分析',
      project: '内容生成器',
      status: 'running',
      progress: 72,
      startTime: new Date(Date.now() - 1800000).toISOString(),
      parameters: {
        sessionIds: ['session-4', 'session-5'],
        timeRange: {
          start: new Date(Date.now() - 86400000 * 14).toISOString(),
          end: new Date().toISOString()
        },
        synthesisMethod: 'semantic_clustering',
        minConfidence: 0.75
      }
    },
    {
      id: 'synthesis_job_3',
      name: '数据分析记忆整合',
      project: '数据分析平台',
      status: 'failed',
      progress: 35,
      startTime: new Date(Date.now() - 7200000).toISOString(),
      endTime: new Date(Date.now() - 6600000).toISOString(),
      parameters: {
        sessionIds: ['session-6', 'session-7', 'session-8'],
        timeRange: {
          start: new Date(Date.now() - 86400000 * 30).toISOString(),
          end: new Date().toISOString()
        },
        synthesisMethod: 'hybrid_approach',
        minConfidence: 0.85
      }
    }
  ];

  // 使用知识图谱状态管理
  const { filters, setSelectedProject, setSearchQuery, setLastVisitedPage } = useKnowledgeGraphState();
  
  // 本地状态
  const [syntheses, setSyntheses] = useState<MemorySynthesis[]>([]);
  const [selectedSynthesis, setSelectedSynthesis] = useState<MemorySynthesis | null>(null);
  const [synthesisJobs, setSynthesisJobs] = useState<SynthesisJob[]>(mockSynthesisJobs);
  const [stats, setStats] = useState<SynthesisStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [minConfidence, setMinConfidence] = useState(0.6);
  
  // RAG知识库管理状态
  const [ragSources, setRagSources] = useState<RAGKnowledgeSource[]>([]);
  const [showAddRAGSource, setShowAddRAGSource] = useState(false);
  const [editingRAGSource, setEditingRAGSource] = useState<RAGKnowledgeSource | null>(null);
  const [ragLoading, setRagLoading] = useState(false);

  const apiClient = getApiClient();

  useEffect(() => {
    setLastVisitedPage('memory-synthesis');
  }, [setLastVisitedPage]);

  useEffect(() => {
    loadSyntheses();
    loadSynthesisJobs();
    loadRAGSources();
  }, []);

  const loadSyntheses = async () => {
    setLoading(true);
    try {
      // 模拟合成数据
      const mockSyntheses: MemorySynthesis[] = [
        {
          id: '1',
          project: 'AI客服助手',
          sessionIds: ['session-1', 'session-2', 'session-3'],
          synthesizedMemories: [
            {
              id: 'mem-1',
              content: '用户对机器学习项目表现出持续的兴趣，特别是在自然语言处理方面',
              confidence: 0.85,
              sources: ['session-1', 'session-2'],
              temporalContext: {
                startTime: new Date(Date.now() - 86400000 * 7).toISOString(),
                endTime: new Date(Date.now() - 86400000 * 2).toISOString(),
                duration: 432000000
              }
            },
            {
              id: 'mem-2',
              content: '用户在讨论技术架构时倾向于关注可扩展性和性能优化',
              confidence: 0.78,
              sources: ['session-2', 'session-3'],
              temporalContext: {
                startTime: new Date(Date.now() - 86400000 * 5).toISOString(),
                endTime: new Date(Date.now() - 86400000 * 1).toISOString(),
                duration: 345600000
              }
            }
          ],
          patterns: [
            {
              id: 'pattern-1',
              type: 'temporal',
              description: '用户通常在工作日的下午进行技术讨论',
              frequency: 0.75,
              significance: 0.68
            },
            {
              id: 'pattern-2',
              type: 'topical',
              description: '技术讨论经常伴随着架构设计和性能优化的话题',
              frequency: 0.82,
              significance: 0.73
            }
          ],
          insights: [
            {
              id: 'insight-1',
              category: 'preference',
              description: '用户偏好实用性强的技术解决方案',
              confidence: 0.79,
              impact: 0.85
            },
            {
              id: 'insight-2',
              category: 'behavior',
              description: '用户在技术决策时会考虑长期维护成本',
              confidence: 0.72,
              impact: 0.78
            }
          ],
          metadata: {
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            lastUpdated: new Date(Date.now() - 1800000).toISOString(),
            totalSessions: 3,
            totalMemories: 15,
            synthesisMethod: 'temporal_clustering'
          }
        }
      ];
      setSyntheses(mockSyntheses);
      calculateStats(mockSyntheses);
    } catch (error) {
      console.error('Failed to load syntheses:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSynthesisJobs = async () => {
    try {
      // 模拟合成任务数据
      const mockJobs: SynthesisJob[] = [
        {
          id: '1',
          name: '客服对话记忆合成',
          project: 'AI客服助手',
          status: 'completed',
          progress: 100,
          startTime: new Date(Date.now() - 3600000).toISOString(),
          endTime: new Date(Date.now() - 3000000).toISOString(),
          parameters: {
            sessionIds: ['session-1', 'session-2', 'session-3'],
            timeRange: {
              start: new Date(Date.now() - 86400000 * 7).toISOString(),
              end: new Date().toISOString()
            },
            synthesisMethod: 'temporal_clustering',
            minConfidence: 0.6
          },
          results: {
            synthesizedMemories: 8,
            discoveredPatterns: 5,
            generatedInsights: 3
          }
        },
        {
          id: '2',
          name: '内容生成模式分析',
          project: '内容生成器',
          status: 'running',
          progress: 45,
          startTime: new Date(Date.now() - 1800000).toISOString(),
          parameters: {
            sessionIds: ['session-4', 'session-5'],
            timeRange: {
              start: new Date(Date.now() - 86400000 * 3).toISOString(),
              end: new Date().toISOString()
            },
            synthesisMethod: 'semantic_clustering',
            minConfidence: 0.7
          }
        }
      ];
      setSynthesisJobs(mockJobs);
    } catch (error) {
      console.error('Failed to load synthesis jobs:', error);
    }
  };

  const calculateStats = (syntheses: MemorySynthesis[]) => {
    let totalMemories = 0;
    let totalPatterns = 0;
    let totalInsights = 0;
    let totalConfidence = 0;
    let confidenceCount = 0;
    const methodDistribution: Record<string, number> = {};

    syntheses.forEach(synthesis => {
      totalMemories += synthesis.synthesizedMemories.length;
      totalPatterns += synthesis.patterns.length;
      totalInsights += synthesis.insights.length;
      
      synthesis.synthesizedMemories.forEach(memory => {
        totalConfidence += memory.confidence;
        confidenceCount++;
      });
      
      methodDistribution[synthesis.metadata.synthesisMethod] = 
        (methodDistribution[synthesis.metadata.synthesisMethod] || 0) + 1;
    });

    setStats({
      totalSyntheses: syntheses.length,
      totalMemories,
      totalPatterns,
      totalInsights,
      averageConfidence: confidenceCount > 0 ? totalConfidence / confidenceCount : 0,
      synthesisMethodDistribution: methodDistribution
    });
  };

  const startSynthesis = async () => {
    try {
      // 模拟启动合成任务
      const newJob: SynthesisJob = {
        id: `job-${Date.now()}`,
        name: '新合成任务',
        project: filters.selectedProject === 'all' ? '默认项目' : filters.selectedProject,
        status: 'running',
        progress: 0,
        startTime: new Date().toISOString(),
        parameters: {
          sessionIds: ['all'],
          timeRange: {
            start: new Date(Date.now() - 86400000 * 7).toISOString(),
            end: new Date().toISOString()
          },
          synthesisMethod: 'temporal_clustering',
          minConfidence
        }
      };
      setSynthesisJobs(prev => [newJob, ...prev]);
    } catch (error) {
      console.error('Failed to start synthesis:', error);
    }
  };

  // RAG知识库管理函数
  const loadRAGSources = async () => {
    setRagLoading(true);
    try {
      const response = await fetch('/api/v1/rag-knowledge/sources');
      if (response.ok) {
        const data = await response.json();
        setRagSources(data.data || data);
      } else {
        throw new Error('Failed to fetch RAG sources');
      }
    } catch (error) {
      console.error('Failed to load RAG sources:', error);
      // 使用模拟数据
      const mockRAGSources: RAGKnowledgeSource[] = [
        {
          id: 'rag-1',
          name: '企业知识库',
          type: 'elasticsearch',
          status: 'connected',
          config: {
            url: 'https://elasticsearch.company.com',
            index: 'knowledge_base',
            apiKey: '***'
          },
          metadata: {
            createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
            lastUpdated: new Date(Date.now() - 3600000).toISOString(),
            lastSync: new Date(Date.now() - 1800000).toISOString(),
            documentCount: 15420
          }
        },
        {
          id: 'rag-2',
          name: '技术文档库',
          type: 'chroma',
          status: 'connected',
          config: {
            url: 'http://chroma.internal:8000',
            collection: 'tech_docs'
          },
          metadata: {
            createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
            lastUpdated: new Date(Date.now() - 7200000).toISOString(),
            lastSync: new Date(Date.now() - 900000).toISOString(),
            documentCount: 8750
          }
        },
        {
          id: 'rag-3',
          name: '本地文件库',
          type: 'local_files',
          status: 'error',
          config: {
            path: '/data/documents',
            extensions: ['.pdf', '.docx', '.txt']
          },
          metadata: {
            createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
            lastUpdated: new Date(Date.now() - 14400000).toISOString(),
            errorMessage: '无法访问指定路径'
          }
        }
      ];
      setRagSources(mockRAGSources);
    } finally {
      setRagLoading(false);
    }
  };

  const addRAGSource = async (sourceData: Partial<RAGKnowledgeSource>) => {
    try {
      const response = await fetch('/api/v1/rag-knowledge/sources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sourceData),
      });
      if (response.ok) {
        await loadRAGSources();
        setShowAddRAGSource(false);
      } else {
        throw new Error('Failed to add RAG source');
      }
    } catch (error) {
      console.error('Failed to add RAG source:', error);
    }
  };

  const updateRAGSource = async (id: string, sourceData: Partial<RAGKnowledgeSource>) => {
    try {
      const response = await fetch(`/api/v1/rag-knowledge/sources/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sourceData),
      });
      if (response.ok) {
        await loadRAGSources();
        setEditingRAGSource(null);
      } else {
        throw new Error('Failed to update RAG source');
      }
    } catch (error) {
      console.error('Failed to update RAG source:', error);
    }
  };

  const deleteRAGSource = async (id: string) => {
    if (!confirm('确定要删除这个知识源吗？')) return;
    
    try {
      const response = await fetch(`/api/v1/rag-knowledge/sources/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        await loadRAGSources();
      } else {
        throw new Error('Failed to delete RAG source');
      }
    } catch (error) {
      console.error('Failed to delete RAG source:', error);
    }
  };

  const testRAGConnection = async (id: string) => {
    try {
      const response = await fetch(`/api/v1/rag-knowledge/sources/${id}/test`, {
        method: 'POST',
      });
      if (response.ok) {
        await loadRAGSources();
      } else {
        throw new Error('Failed to test RAG connection');
      }
    } catch (error) {
      console.error('Failed to test RAG connection:', error);
    }
  };

  const filteredSyntheses = syntheses.filter(synthesis => {
    const matchesSearch = !filters.searchQuery || synthesis.synthesizedMemories.some(memory =>
      memory.content.toLowerCase().includes(filters.searchQuery.toLowerCase())
    ) || synthesis.patterns.some(pattern =>
      pattern.description.toLowerCase().includes(filters.searchQuery.toLowerCase())
    );
    const matchesMethod = selectedMethod === 'all' || synthesis.metadata.synthesisMethod === selectedMethod;
    const matchesProject = filters.selectedProject === 'all' || synthesis.project === filters.selectedProject;
    
    return matchesSearch && matchesMethod && matchesProject;
  });

  const filteredJobs = synthesisJobs.filter(job => {
    const matchesProject = filters.selectedProject === 'all' || job.project === filters.selectedProject;
    return matchesProject;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  const formatDuration = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}小时${minutes}分钟`;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence < 0.5) return 'bg-red-100 text-red-800';
    if (confidence < 0.8) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getJobStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending': 'bg-gray-100 text-gray-800',
      'running': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'failed': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // 计算基于筛选的统计信息
  const getFilteredStats = () => {
    const filteredSynthesesCount = filteredSyntheses.length;
    const filteredJobsCount = filteredJobs.length;
    
    const totalMemories = filteredSyntheses.reduce((sum, synthesis) => 
      sum + synthesis.synthesizedMemories.length, 0);
    const totalPatterns = filteredSyntheses.reduce((sum, synthesis) => 
      sum + synthesis.patterns.length, 0);
    const totalInsights = filteredSyntheses.reduce((sum, synthesis) => 
      sum + synthesis.insights.length, 0);

    return {
      totalSyntheses: filteredSynthesesCount,
      totalJobs: filteredJobsCount,
      totalMemories,
      totalPatterns,
      totalInsights
    };
  };

  return (
    <div className="space-y-6">
      <KnowledgeGraphBreadcrumb selectedProject={filters.selectedProject} />
      {/* 页面标题 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">跨会话记忆合成</h1>
          <p className="text-muted-foreground mt-2">
            智能整合多个会话的记忆，发现模式和洞察，生成综合性知识
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadSyntheses} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
          <Button onClick={startSynthesis}>
            <Merge className="h-4 w-4 mr-2" />
            开始合成
          </Button>
        </div>
      </div>

      {/* 项目选择和筛选控制 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">项目选择</label>
              <Select value={filters.selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="选择项目" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有项目</SelectItem>
                  {mockProjects.map(project => (
                    <SelectItem key={project.id} value={project.name}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">搜索</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="搜索记忆内容..."
                  value={filters.searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">合成方法</label>
              <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="选择方法" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有方法</SelectItem>
                  <SelectItem value="temporal_clustering">时序聚类</SelectItem>
                  <SelectItem value="semantic_similarity">语义相似性</SelectItem>
                  <SelectItem value="pattern_recognition">模式识别</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Merge className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  {filters.selectedProject === 'all' ? '总合成数' : `${filters.selectedProject} 合成数`}
                </p>
                <p className="text-2xl font-bold">{getFilteredStats().totalSyntheses}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">合成任务</p>
                <p className="text-2xl font-bold">{getFilteredStats().totalJobs}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">合成记忆</p>
                <p className="text-2xl font-bold">{getFilteredStats().totalMemories}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">发现模式</p>
                <p className="text-2xl font-bold">{getFilteredStats().totalPatterns}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Zap className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">生成洞察</p>
                <p className="text-2xl font-bold">{getFilteredStats().totalInsights}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 主要内容区域 */}
      <Tabs defaultValue="synthesis" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="synthesis">记忆合成</TabsTrigger>
          <TabsTrigger value="jobs">合成任务</TabsTrigger>
          <TabsTrigger value="rag">RAG知识库</TabsTrigger>
        </TabsList>

        <TabsContent value="synthesis">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 合成控制和任务 */}
            <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                合成参数
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">最小置信度</label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={minConfidence}
                    onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground">
                    {(minConfidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">合成方法</label>
                <select className="w-full mt-1 px-3 py-2 border border-input bg-background rounded-md">
                  <option value="temporal_clustering">时序聚类</option>
                  <option value="semantic_clustering">语义聚类</option>
                  <option value="hybrid_approach">混合方法</option>
                </select>
              </div>
              
              <Button onClick={startSynthesis} className="w-full">
                <Play className="h-4 w-4 mr-2" />
                启动新合成任务
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>合成任务</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredJobs.map((job) => (
                  <div key={job.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className={getJobStatusColor(job.status)}>
                          {job.status}
                        </Badge>
                        <span className="text-sm font-medium">{job.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(job.startTime)}
                      </span>
                    </div>
                    
                    <div className="text-xs text-muted-foreground mb-2">
                      项目: {job.project} | 方法: {job.parameters.synthesisMethod}
                    </div>
                    
                    {job.status === 'running' && (
                      <div className="mb-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span>进度</span>
                          <span>{job.progress}%</span>
                        </div>
                        <Progress value={job.progress} className="h-2" />
                      </div>
                    )}
                    
                    {job.results && (
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span>合成记忆:</span>
                          <span className="font-medium">{job.results.synthesizedMemories}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>发现模式:</span>
                          <span className="font-medium">{job.results.discoveredPatterns}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>生成洞察:</span>
                          <span className="font-medium">{job.results.generatedInsights}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {synthesisJobs.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    暂无合成任务
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 合成结果 */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                合成结果过滤
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索合成内容..."
                    value={filters.searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
                
                <select
                  value={selectedMethod}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  className="px-3 py-2 border border-input bg-background rounded-md"
                >
                  <option value="all">所有合成方法</option>
                  <option value="temporal_clustering">时序聚类</option>
                  <option value="semantic_clustering">语义聚类</option>
                  <option value="hybrid_approach">混合方法</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {filteredSyntheses.map((synthesis) => (
              <div key={synthesis.id} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedSynthesis(synthesis)}>
                <Card>
                  <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        合成结果 #{synthesis.id}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        项目: {synthesis.project} • {synthesis.metadata.totalSessions} 个会话 • {synthesis.metadata.totalMemories} 条记忆
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {synthesis.metadata.synthesisMethod}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {synthesis.synthesizedMemories.length}
                      </div>
                      <div className="text-xs text-muted-foreground">合成记忆</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {synthesis.patterns.length}
                      </div>
                      <div className="text-xs text-muted-foreground">发现模式</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {synthesis.insights.length}
                      </div>
                      <div className="text-xs text-muted-foreground">生成洞察</div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    创建时间: {formatDate(synthesis.metadata.createdAt)} | 
                    最后更新: {formatDate(synthesis.metadata.lastUpdated)}
                  </div>
                </CardContent>
                </Card>
              </div>
            ))}
            
            {filteredSyntheses.length === 0 && (
              <Card>
                <CardContent className="flex items-center justify-center h-32">
                  <div className="text-center text-muted-foreground">
                    没有找到匹配的合成结果
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
        </TabsContent>

        <TabsContent value="jobs">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  合成任务列表
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {synthesisJobs.map((job) => (
                    <div key={job.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{job.name}</h4>
                          <p className="text-sm text-muted-foreground">项目: {job.project}</p>
                        </div>
                        <Badge variant={job.status === 'completed' ? 'default' : 
                                     job.status === 'running' ? 'secondary' : 
                                     job.status === 'failed' ? 'destructive' : 'outline'}>
                          {job.status === 'pending' ? '等待中' :
                           job.status === 'running' ? '运行中' :
                           job.status === 'completed' ? '已完成' : '失败'}
                        </Badge>
                      </div>
                      
                      {job.status === 'running' && (
                        <div className="mb-2">
                          <Progress value={job.progress} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">
                            进度: {job.progress}%
                          </p>
                        </div>
                      )}
                      
                      <div className="text-xs text-muted-foreground">
                        开始时间: {formatDate(job.startTime)}
                        {job.endTime && ` | 结束时间: ${formatDate(job.endTime)}`}
                      </div>
                      
                      {job.results && (
                        <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                          <div>合成记忆: {job.results.synthesizedMemories}</div>
                          <div>发现模式: {job.results.discoveredPatterns}</div>
                          <div>生成洞察: {job.results.generatedInsights}</div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {synthesisJobs.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      暂无合成任务
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rag">
          <div className="space-y-4">
            {/* RAG知识库管理头部 */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    <Database className="h-5 w-5 mr-2" />
                    RAG知识库管理
                  </CardTitle>
                  <Button onClick={() => setShowAddRAGSource(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    添加知识源
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {ragSources.length}
                    </div>
                    <div className="text-xs text-muted-foreground">总知识源</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {ragSources.filter(s => s.status === 'connected').length}
                    </div>
                    <div className="text-xs text-muted-foreground">已连接</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {ragSources.filter(s => s.status === 'error').length}
                    </div>
                    <div className="text-xs text-muted-foreground">错误</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {ragSources.reduce((sum, s) => sum + (s.metadata.documentCount || 0), 0)}
                    </div>
                    <div className="text-xs text-muted-foreground">总文档数</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* RAG知识源列表 */}
            <div className="space-y-4">
              {ragLoading ? (
                <Card>
                  <CardContent className="flex items-center justify-center h-32">
                    <div className="text-center">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                      <div className="text-muted-foreground">加载中...</div>
                    </div>
                  </CardContent>
                </Card>
              ) : ragSources.length === 0 ? (
                <Card>
                  <CardContent className="flex items-center justify-center h-32">
                    <div className="text-center text-muted-foreground">
                      <Database className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <div>暂无RAG知识源</div>
                      <div className="text-sm">点击"添加知识源"开始配置</div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                ragSources.map((source) => (
                  <Card key={source.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center">
                            <Database className="h-5 w-5 mr-2" />
                            {source.name}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            类型: {source.type} • 
                            {source.metadata.documentCount ? ` ${source.metadata.documentCount} 个文档` : ' 未知文档数'}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={
                            source.status === 'connected' ? 'default' :
                            source.status === 'disconnected' ? 'secondary' : 'destructive'
                          }>
                            {source.status === 'connected' ? (
                              <><CheckCircle className="h-3 w-3 mr-1" />已连接</>
                            ) : source.status === 'disconnected' ? (
                              <><XCircle className="h-3 w-3 mr-1" />未连接</>
                            ) : (
                              <><AlertCircle className="h-3 w-3 mr-1" />错误</>
                            )}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => testRAGConnection(source.id)}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            测试
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingRAGSource(source)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            编辑
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteRAGSource(source.id)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            删除
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">连接地址:</span>
                          <div className="text-muted-foreground">{source.config.url || '未配置'}</div>
                        </div>
                        <div>
                          <span className="font-medium">索引/集合:</span>
                          <div className="text-muted-foreground">
                            {source.config.index || source.config.collection || '未配置'}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">创建时间:</span>
                          <div className="text-muted-foreground">{formatDate(source.metadata.createdAt)}</div>
                        </div>
                        <div>
                          <span className="font-medium">最后同步:</span>
                          <div className="text-muted-foreground">
                            {source.metadata.lastSync ? formatDate(source.metadata.lastSync) : '从未同步'}
                          </div>
                        </div>
                      </div>
                      
                      {source.status === 'error' && source.metadata.errorMessage && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                          <div className="flex items-center">
                            <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                            <span className="text-sm text-red-800">错误信息:</span>
                          </div>
                          <div className="text-sm text-red-700 mt-1">{source.metadata.errorMessage}</div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </TabsContent>

       </Tabs>

      {/* 详细信息模态框 */}
      {selectedSynthesis && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>合成详情 #{selectedSynthesis.id}</CardTitle>
              <Button variant="outline" onClick={() => setSelectedSynthesis(null)}>
                关闭
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="memories" className="space-y-4">
              <TabsList>
                <TabsTrigger value="memories">合成记忆</TabsTrigger>
                <TabsTrigger value="patterns">发现模式</TabsTrigger>
                <TabsTrigger value="insights">生成洞察</TabsTrigger>
              </TabsList>

              <TabsContent value="memories" className="space-y-4">
                {selectedSynthesis.synthesizedMemories.map((memory) => (
                  <div key={memory.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <Badge className={getConfidenceColor(memory.confidence)}>
                        置信度: {(memory.confidence * 100).toFixed(1)}%
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDuration(memory.temporalContext.duration)}
                      </span>
                    </div>
                    <p className="text-sm mb-2">{memory.content}</p>
                    <div className="text-xs text-muted-foreground">
                      来源会话: {memory.sources.join(', ')}
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="patterns" className="space-y-4">
                {selectedSynthesis.patterns.map((pattern) => (
                  <div key={pattern.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="secondary">{pattern.type}</Badge>
                      <div className="text-xs text-muted-foreground">
                        频率: {(pattern.frequency * 100).toFixed(1)}% | 
                        重要性: {(pattern.significance * 100).toFixed(1)}%
                      </div>
                    </div>
                    <p className="text-sm">{pattern.description}</p>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="insights" className="space-y-4">
                {selectedSynthesis.insights.map((insight) => (
                  <div key={insight.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline">{insight.category}</Badge>
                      <div className="text-xs text-muted-foreground">
                        置信度: {(insight.confidence * 100).toFixed(1)}% | 
                        影响力: {(insight.impact * 100).toFixed(1)}%
                      </div>
                    </div>
                    <p className="text-sm">{insight.description}</p>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}