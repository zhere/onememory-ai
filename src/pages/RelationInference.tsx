import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
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
} from 'lucide-react';
import { getApiClient } from '@/lib/api';
import KnowledgeGraphBreadcrumb from '@/components/KnowledgeGraphBreadcrumb';
import { useKnowledgeGraphState } from '@/hooks/useKnowledgeGraphState';

interface TemporalRelation {
  id: string;
  relationId: string;
  sourceEntityId: string;
  targetEntityId: string;
  relationType: string;
  strength: number;
  confidence: number;
  properties: Record<string, any>;
  temporalContext: {
    createdAt: string;
    lastUpdated: string;
    validFrom: string;
    validTo?: string;
  };
  inferenceMetadata: {
    method: string;
    evidence: string[];
    reasoning: string;
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

interface InferenceStats {
  totalRelations: number;
  inferredRelations: number;
  averageConfidence: number;
  relationTypes: Record<string, number>;
  strengthDistribution: {
    weak: number;
    medium: number;
    strong: number;
  };
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

interface Project {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive" | "maintenance";
}

// 项目数据
const mockProjects: Project[] = [
  { id: "1", name: "AI客服助手", description: "智能客服系统", status: "active" },
  { id: "2", name: "内容生成器", description: "AI内容创作工具", status: "active" },
  { id: "3", name: "数据分析平台", description: "企业数据分析", status: "maintenance" }
];

// 更新推理关系数据，添加项目关联
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

// 更新推理任务数据，添加项目关联
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

export default function RelationInference() {
  // 使用知识图谱状态管理
  const { filters, setSelectedProject, setSearchQuery, setLastVisitedPage } = useKnowledgeGraphState();
  
  // 本地状态管理
  const [relations, setRelations] = useState<InferredRelation[]>(mockInferredRelations);
  const [inferenceJobs, setInferenceJobs] = useState<InferenceJob[]>(mockInferenceJobs);
  const [selectedConfidenceRange, setSelectedConfidenceRange] = useState("all");
  const [selectedValidationStatus, setSelectedValidationStatus] = useState("all");
  const [selectedJobStatus, setSelectedJobStatus] = useState("all");
  const [selectedRelation, setSelectedRelation] = useState<InferredRelation | null>(null);

  // 设置最后访问的页面
  useEffect(() => {
    setLastVisitedPage('relation-inference');
  }, [setLastVisitedPage]);

  // 根据项目筛选数据
  const filteredRelations = relations.filter(relation => {
    const projectMatch = filters.selectedProject === "all" || relation.project === filters.selectedProject;
    const searchMatch = filters.searchQuery === "" || 
      relation.sourceEntity.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      relation.targetEntity.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      relation.relationType.toLowerCase().includes(filters.searchQuery.toLowerCase());
    
    const confidenceMatch = selectedConfidenceRange === "all" || 
      (selectedConfidenceRange === "high" && relation.confidence >= 0.8) ||
      (selectedConfidenceRange === "medium" && relation.confidence >= 0.6 && relation.confidence < 0.8) ||
      (selectedConfidenceRange === "low" && relation.confidence < 0.6);
    
    const validationMatch = selectedValidationStatus === "all" || 
      relation.metadata.validationStatus === selectedValidationStatus;
    
    return projectMatch && searchMatch && confidenceMatch && validationMatch;
  });

  const filteredJobs = inferenceJobs.filter(job => 
    filters.selectedProject === "all" || job.project === filters.selectedProject
  ).filter(job =>
    selectedJobStatus === "all" || job.status === selectedJobStatus
  );

  // 统计信息
  const stats = {
    totalRelations: filteredRelations.length,
    highConfidenceRelations: filteredRelations.filter(r => r.confidence >= 0.8).length,
    confirmedRelations: filteredRelations.filter(r => r.metadata.validationStatus === "confirmed").length,
    activeJobs: filteredJobs.filter(j => j.status === "running").length,
    avgConfidence: filteredRelations.length > 0 
      ? (filteredRelations.reduce((sum, r) => sum + r.confidence, 0) / filteredRelations.length * 100).toFixed(1)
      : "0"
  };

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case "running": return "text-blue-600";
      case "completed": return "text-green-600";
      case "pending": return "text-yellow-600";
      case "failed": return "text-red-600";
      default: return "text-gray-600";
    }
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

  return (
    <div className="space-y-6">
      {/* 面包屑导航 */}
      <KnowledgeGraphBreadcrumb />
      
      {/* 页面标题和项目选择 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">关系推理</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            智能推理和发现实体间的潜在关系
          </p>
        </div>
        <div className="flex items-center space-x-4">
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
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新数据
          </Button>
          <Button size="sm">
            <Play className="h-4 w-4 mr-2" />
            新建推理任务
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">推理关系</p>
                <p className="text-2xl font-bold">{stats.totalRelations}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">高置信度</p>
                <p className="text-2xl font-bold">{stats.highConfidenceRelations}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">已确认</p>
                <p className="text-2xl font-bold">{stats.confirmedRelations}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">运行中任务</p>
                <p className="text-2xl font-bold">{stats.activeJobs}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">平均置信度</p>
                <p className="text-2xl font-bold">{stats.avgConfidence}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和筛选 */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索关系..."
                  value={filters.searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedConfidenceRange} onValueChange={setSelectedConfidenceRange}>
              <SelectTrigger>
                <SelectValue placeholder="置信度范围" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有置信度</SelectItem>
                <SelectItem value="high">高 (≥80%)</SelectItem>
                <SelectItem value="medium">中 (60-80%)</SelectItem>
                <SelectItem value="low">低 (&lt;60%)</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedValidationStatus} onValueChange={setSelectedValidationStatus}>
              <SelectTrigger>
                <SelectValue placeholder="验证状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有状态</SelectItem>
                <SelectItem value="confirmed">已确认</SelectItem>
                <SelectItem value="pending">待验证</SelectItem>
                <SelectItem value="needs_review">需要审查</SelectItem>
                <SelectItem value="rejected">已拒绝</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedJobStatus} onValueChange={setSelectedJobStatus}>
              <SelectTrigger>
                <SelectValue placeholder="任务状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有任务</SelectItem>
                <SelectItem value="running">运行中</SelectItem>
                <SelectItem value="completed">已完成</SelectItem>
                <SelectItem value="pending">待执行</SelectItem>
                <SelectItem value="failed">失败</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" className="w-full">
              <Filter className="h-4 w-4 mr-2" />
              高级筛选
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 主要内容区域 */}
      <Tabs defaultValue="relations" className="space-y-6">
        <TabsList>
          <TabsTrigger value="relations">推理关系</TabsTrigger>
          <TabsTrigger value="jobs">推理任务</TabsTrigger>
          <TabsTrigger value="analytics">分析报告</TabsTrigger>
        </TabsList>

        <TabsContent value="relations">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 关系列表 */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="h-5 w-5 mr-2" />
                    推理关系列表
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredRelations.map((relation) => (
                      <div 
                        key={relation.id} 
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          selectedRelation?.id === relation.id 
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700' 
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                        onClick={() => setSelectedRelation(relation)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold">{relation.sourceEntity} → {relation.targetEntity}</h3>
                              <Badge variant="secondary">{relation.relationType}</Badge>
                              <Badge variant="outline">{relation.project}</Badge>
                            </div>
                            <div className="mt-2 text-sm text-muted-foreground">
                              <div className="flex items-center space-x-4">
                                <span className="flex items-center">
                                  <BarChart3 className="w-3 h-3 mr-1" />
                                  置信度: {(relation.confidence * 100).toFixed(1)}%
                                </span>
                                <span className="flex items-center">
                                  <Zap className="w-3 h-3 mr-1" />
                                  方法: {relation.inferenceMethod}
                                </span>
                                <span className={`flex items-center ${getValidationStatusColor(relation.metadata.validationStatus)}`}>
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  {relation.metadata.validationStatus}
                                </span>
                              </div>
                            </div>
                            <div className="mt-2">
                              <Progress value={relation.confidence * 100} className="h-2" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 关系详情 */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="h-5 w-5 mr-2" />
                    {selectedRelation ? '关系详情' : '选择关系查看详情'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedRelation ? (
                    <div className="space-y-4">
                      {/* 关系基本信息 */}
                      <div className="border-b pb-4">
                        <h3 className="font-semibold text-lg">
                          {selectedRelation.sourceEntity} → {selectedRelation.targetEntity}
                        </h3>
                        <div className="mt-2 space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">关系类型:</span>
                            <span>{selectedRelation.relationType}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">项目:</span>
                            <span>{selectedRelation.project}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">置信度:</span>
                            <span>{(selectedRelation.confidence * 100).toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">推理方法:</span>
                            <span>{selectedRelation.inferenceMethod}</span>
                          </div>
                        </div>
                      </div>

                      {/* 证据信息 */}
                      <div className="border-b pb-4">
                        <h4 className="font-medium mb-2">支持证据</h4>
                        <div className="space-y-2">
                          {selectedRelation.evidence.map((evidence, index) => (
                            <div key={index} className="flex items-start space-x-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span>{evidence}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 元数据信息 */}
                      <div>
                        <h4 className="font-medium mb-2">元数据</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">推理时间:</span>
                            <span>{new Date(selectedRelation.metadata.inferredAt).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">最后验证:</span>
                            <span>{new Date(selectedRelation.metadata.lastValidated).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">验证状态:</span>
                            <Badge variant="outline" className={getValidationStatusColor(selectedRelation.metadata.validationStatus)}>
                              {selectedRelation.metadata.validationStatus}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">关系强度:</span>
                            <span>{selectedRelation.metadata.strength}</span>
                          </div>
                        </div>
                      </div>

                      {/* 操作按钮 */}
                      <div className="pt-4 space-y-2">
                        <Button className="w-full" size="sm">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          确认关系
                        </Button>
                        <Button variant="outline" className="w-full" size="sm">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          需要审查
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>点击左侧关系查看详细信息</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="jobs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                推理任务管理
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredJobs.map((job) => (
                  <div key={job.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{job.name}</h3>
                          <Badge variant="outline">{job.project}</Badge>
                          <Badge variant="secondary" className={getStatusColor(job.status)}>
                            {job.status}
                          </Badge>
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              开始: {new Date(job.startTime).toLocaleString()}
                            </span>
                            <span className="flex items-center">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              进度: {job.progress}%
                            </span>
                            <span>优先级: {job.metadata.priority}</span>
                          </div>
                        </div>
                        <div className="mt-3">
                          <Progress value={job.progress} className="h-2" />
                        </div>
                        {job.results.total_relations_found > 0 && (
                          <div className="mt-3 grid grid-cols-4 gap-4 text-sm">
                            <div className="text-center">
                              <div className="font-medium">{job.results.total_relations_found}</div>
                              <div className="text-muted-foreground">总关系</div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium text-green-600">{job.results.high_confidence_relations}</div>
                              <div className="text-muted-foreground">高置信度</div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium text-yellow-600">{job.results.medium_confidence_relations}</div>
                              <div className="text-muted-foreground">中置信度</div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium text-red-600">{job.results.low_confidence_relations}</div>
                              <div className="text-muted-foreground">低置信度</div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        {job.status === "running" && (
                          <Button variant="outline" size="sm">
                            <Pause className="h-4 w-4" />
                          </Button>
                        )}
                        {job.status === "pending" && (
                          <Button variant="outline" size="sm">
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>关系类型分布</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...new Set(filteredRelations.map(r => r.relationType))].map(type => {
                    const count = filteredRelations.filter(r => r.relationType === type).length;
                    const percentage = (count / filteredRelations.length * 100).toFixed(1);
                    return (
                      <div key={type} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{type}</span>
                          <span>{count} ({percentage}%)</span>
                        </div>
                        <Progress value={parseFloat(percentage)} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>置信度分布</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: "高置信度 (≥80%)", count: filteredRelations.filter(r => r.confidence >= 0.8).length, color: "bg-green-500" },
                    { label: "中置信度 (60-80%)", count: filteredRelations.filter(r => r.confidence >= 0.6 && r.confidence < 0.8).length, color: "bg-yellow-500" },
                    { label: "低置信度 (<60%)", count: filteredRelations.filter(r => r.confidence < 0.6).length, color: "bg-red-500" }
                  ].map(item => {
                    const percentage = filteredRelations.length > 0 ? (item.count / filteredRelations.length * 100).toFixed(1) : "0";
                    return (
                      <div key={item.label} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{item.label}</span>
                          <span>{item.count} ({percentage}%)</span>
                        </div>
                        <Progress value={parseFloat(percentage)} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}