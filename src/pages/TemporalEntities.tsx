import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  Search, 
  Filter,
  RefreshCw,
  Calendar,
  TrendingUp,
  Eye,
  Settings,
  BarChart3,
  Activity,
  Users,
  FileText
} from 'lucide-react';
import { getApiClient } from '@/lib/api';
import KnowledgeGraphBreadcrumb from '@/components/KnowledgeGraphBreadcrumb';
import { useKnowledgeGraphState, getProjectDisplayName } from '@/hooks/useKnowledgeGraphState';

interface TemporalEntity {
  id: string;
  entityId: string;
  entityType: string;
  project: string;
  properties: Record<string, any>;
  temporalContext: {
    createdAt: string;
    lastUpdated: string;
    validFrom: string;
    validTo?: string;
  };
  metadata: {
    source: string;
    confidence: number;
    updateCount: number;
    [key: string]: any;
  };
}

interface TimelineEvent {
  timestamp: string;
  eventType: string;
  description: string;
  changes: Record<string, any>;
  metadata: Record<string, any>;
}

interface Timeline {
  id: string;
  entityId: string;
  project: string;
  events: TimelineEvent[];
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

// 更新时序实体数据，添加项目关联
const mockEntities: TemporalEntity[] = [
  {
    id: "1",
    entityId: "user_001",
    entityType: "user",
    project: "AI客服助手",
    properties: {
      name: "张三",
      role: "产品经理",
      department: "产品部",
      level: "senior"
    },
    temporalContext: {
      createdAt: "2024-01-01T00:00:00Z",
      lastUpdated: "2024-01-15T10:30:00Z",
      validFrom: "2024-01-01T00:00:00Z",
      validTo: undefined
    },
    metadata: {
      source: "user_management",
      confidence: 0.95,
      updateCount: 5
    }
  },
  {
    id: "2",
    entityId: "project_ai_assistant",
    entityType: "project",
    project: "AI客服助手",
    properties: {
      name: "AI智能客服系统",
      status: "active",
      priority: "high",
      budget: 500000,
      team_size: 8
    },
    temporalContext: {
      createdAt: "2024-01-01T00:00:00Z",
      lastUpdated: "2024-01-16T14:20:00Z",
      validFrom: "2024-01-01T00:00:00Z",
      validTo: undefined
    },
    metadata: {
      source: "project_management",
      confidence: 0.98,
      updateCount: 12
    }
  },
  {
    id: "3",
    entityId: "model_gpt4",
    entityType: "ai_model",
    project: "内容生成器",
    properties: {
      name: "GPT-4 Turbo",
      version: "gpt-4-1106-preview",
      provider: "OpenAI",
      max_tokens: 128000,
      cost_per_1k_tokens: 0.01
    },
    temporalContext: {
      createdAt: "2024-01-05T00:00:00Z",
      lastUpdated: "2024-01-14T09:15:00Z",
      validFrom: "2024-01-05T00:00:00Z",
      validTo: undefined
    },
    metadata: {
      source: "model_registry",
      confidence: 0.92,
      updateCount: 3
    }
  },
  {
    id: "4",
    entityId: "dataset_customer_feedback",
    entityType: "dataset",
    project: "数据分析平台",
    properties: {
      name: "客户反馈数据集",
      size: "2.5GB",
      records: 150000,
      format: "JSON",
      last_updated: "2024-01-13T16:45:00Z"
    },
    temporalContext: {
      createdAt: "2023-12-01T00:00:00Z",
      lastUpdated: "2024-01-13T16:45:00Z",
      validFrom: "2023-12-01T00:00:00Z",
      validTo: undefined
    },
    metadata: {
      source: "data_warehouse",
      confidence: 0.88,
      updateCount: 25
    }
  }
];

// 更新时间线数据，添加项目关联
const mockTimelines: Timeline[] = [
  {
    id: "1",
    entityId: "user_001",
    project: "AI客服助手",
    events: [
      {
        timestamp: "2024-01-01T00:00:00Z",
        eventType: "created",
        description: "用户账户创建",
        changes: {
          name: "张三",
          role: "初级产品经理",
          department: "产品部"
        },
        metadata: { source: "user_registration" }
      },
      {
        timestamp: "2024-01-10T09:00:00Z",
        eventType: "role_updated",
        description: "职位晋升",
        changes: {
          role: { from: "初级产品经理", to: "产品经理" },
          level: { from: "junior", to: "senior" }
        },
        metadata: { source: "hr_system", approver: "李四" }
      },
      {
        timestamp: "2024-01-15T10:30:00Z",
        eventType: "project_assigned",
        description: "分配到AI客服项目",
        changes: {
          projects: { added: ["AI客服助手"] }
        },
        metadata: { source: "project_management" }
      }
    ]
  },
  {
    id: "2",
    entityId: "project_ai_assistant",
    project: "AI客服助手",
    events: [
      {
        timestamp: "2024-01-01T00:00:00Z",
        eventType: "created",
        description: "项目立项",
        changes: {
          name: "AI智能客服系统",
          status: "planning",
          budget: 500000
        },
        metadata: { source: "project_initiation" }
      },
      {
        timestamp: "2024-01-05T14:00:00Z",
        eventType: "status_updated",
        description: "项目状态更新",
        changes: {
          status: { from: "planning", to: "active" },
          team_size: { from: 5, to: 8 }
        },
        metadata: { source: "project_management" }
      },
      {
        timestamp: "2024-01-16T14:20:00Z",
        eventType: "milestone_reached",
        description: "完成第一阶段开发",
        changes: {
          progress: { from: 30, to: 60 },
          priority: { from: "medium", to: "high" }
        },
        metadata: { source: "milestone_tracking" }
      }
    ]
  }
];

export default function TemporalEntities() {
  // 使用知识图谱状态管理hook
  const {
    filters,
    setSelectedProject,
    setSearchQuery,
    setSelectedEntityType,
    setLastVisitedPage
  } = useKnowledgeGraphState();

  // 解构筛选器状态
  const { selectedProject, searchQuery, selectedEntityType } = filters;

  // 页面数据状态
  const [entities, setEntities] = useState<TemporalEntity[]>(mockEntities);
  const [timelines, setTimelines] = useState<Timeline[]>(mockTimelines);
  
  // 页面特有状态
  const [selectedTimeRange, setSelectedTimeRange] = useState("all");
  const [selectedEntity, setSelectedEntity] = useState<TemporalEntity | null>(null);

  // 设置当前页面为最后访问页面
  useEffect(() => {
    setLastVisitedPage('/temporal-entities');
  }, [setLastVisitedPage]);

  // 根据项目筛选数据
  const filteredEntities = entities.filter(entity => {
    const projectMatch = selectedProject === "all" || entity.project === selectedProject;
    const typeMatch = selectedEntityType === "all" || entity.entityType === selectedEntityType;
    const searchMatch = searchQuery === "" || 
      entity.properties.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entity.entityId.toLowerCase().includes(searchQuery.toLowerCase());
    
    return projectMatch && typeMatch && searchMatch;
  });

  const filteredTimelines = timelines.filter(timeline => 
    selectedProject === "all" || timeline.project === selectedProject
  );

  // 处理时间范围筛选
  const getTimeRangeFilter = () => {
    const now = new Date();
    switch (selectedTimeRange) {
      case "week":
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case "month":
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case "quarter":
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      default:
        return null;
    }
  };

  const timeRangeFilter = getTimeRangeFilter();
  const filteredEntitiesByTime = timeRangeFilter 
    ? filteredEntities.filter(entity => 
        new Date(entity.temporalContext.lastUpdated) >= timeRangeFilter
      )
    : filteredEntities;

  // 统计信息
  const stats = {
    totalEntities: filteredEntities.length,
    activeEntities: filteredEntities.filter(e => !e.temporalContext.validTo).length,
    recentUpdates: filteredEntities.filter(e => {
      const lastUpdate = new Date(e.temporalContext.lastUpdated);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return lastUpdate >= weekAgo;
    }).length,
    avgConfidence: filteredEntities.length > 0 
      ? (filteredEntities.reduce((sum, e) => sum + (e.metadata.confidence || 0), 0) / filteredEntities.length * 100).toFixed(1)
      : "0"
  };

  // 获取实体类型列表
  const entityTypes = [...new Set(entities.map(e => e.entityType))];

  return (
    <div className="space-y-6">
      <KnowledgeGraphBreadcrumb currentPage="temporal-entities" />
      
      {/* 页面标题和项目选择 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">时序实体</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            管理和追踪实体的时间演化过程
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={selectedProject} onValueChange={setSelectedProject}>
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
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">总实体数</p>
                <p className="text-2xl font-bold">{stats.totalEntities}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">活跃实体</p>
                <p className="text-2xl font-bold">{stats.activeEntities}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">近期更新</p>
                <p className="text-2xl font-bold">{stats.recentUpdates}</p>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索实体..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedEntityType} onValueChange={setSelectedEntityType}>
              <SelectTrigger>
                <SelectValue placeholder="实体类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有类型</SelectItem>
                {entityTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
              <SelectTrigger>
                <SelectValue placeholder="时间范围" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部时间</SelectItem>
                <SelectItem value="week">最近一周</SelectItem>
                <SelectItem value="month">最近一月</SelectItem>
                <SelectItem value="quarter">最近三月</SelectItem>
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 实体列表 */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                时序实体列表
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredEntitiesByTime.map((entity) => (
                  <div 
                    key={entity.id} 
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedEntity?.id === entity.id 
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => setSelectedEntity(entity)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{entity.properties.name || entity.entityId}</h3>
                          <Badge variant="secondary">{entity.entityType}</Badge>
                          <Badge variant="outline">{entity.project}</Badge>
                          {entity.metadata.confidence && (
                            <Badge variant="outline">
                              {(entity.metadata.confidence * 100).toFixed(1)}%
                            </Badge>
                          )}
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              创建: {new Date(entity.temporalContext.createdAt).toLocaleDateString()}
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              更新: {new Date(entity.temporalContext.lastUpdated).toLocaleDateString()}
                            </span>
                            <span>更新次数: {entity.metadata.updateCount}</span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <div className="flex items-center space-x-2 text-xs">
                            <span className="text-muted-foreground">有效期:</span>
                            <span>{new Date(entity.temporalContext.validFrom).toLocaleDateString()}</span>
                            <span>-</span>
                            <span>{entity.temporalContext.validTo ? new Date(entity.temporalContext.validTo).toLocaleDateString() : '持续有效'}</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                         <Eye className="h-4 w-4" />
                       </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 实体详情和时间线 */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                {selectedEntity ? '实体时间线' : '选择实体查看详情'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedEntity ? (
                <div className="space-y-4">
                  {/* 实体基本信息 */}
                  <div className="border-b pb-4">
                    <h3 className="font-semibold text-lg">{selectedEntity.properties.name || selectedEntity.entityId}</h3>
                    <div className="mt-2 space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">类型:</span>
                        <span>{selectedEntity.entityType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">项目:</span>
                        <span>{selectedEntity.project}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">置信度:</span>
                        <span>{(selectedEntity.metadata.confidence * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>

                  {/* 属性信息 */}
                  <div className="border-b pb-4">
                    <h4 className="font-medium mb-2">当前属性</h4>
                    <div className="space-y-1 text-sm">
                      {Object.entries(selectedEntity.properties).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-muted-foreground">{key}:</span>
                          <span className="text-right">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 时间线事件 */}
                  <div>
                    <h4 className="font-medium mb-2">变更历史</h4>
                    <div className="space-y-3">
                      {filteredTimelines
                        .find(t => t.entityId === selectedEntity.entityId)
                        ?.events.map((event, index) => (
                        <div key={index} className="border-l-2 border-blue-200 pl-4 pb-3">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {event.eventType}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(event.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm mt-1">{event.description}</p>
                          {event.changes && (
                             <div className="mt-2 text-xs text-muted-foreground">
                               {Object.entries(event.changes).map(([key, change]) => (
                                 <div key={key}>
                                   {typeof change === 'object' && change !== null && 'from' in change && 'to' in change ? (
                                     <span>{key}: {String((change as any).from)} → {String((change as any).to)}</span>
                                   ) : (
                                     <span>{key}: {String(change)}</span>
                                   )}
                                 </div>
                               ))}
                             </div>
                           )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>点击左侧实体查看详细的时间演化信息</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}