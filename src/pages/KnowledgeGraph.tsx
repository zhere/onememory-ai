import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Network, 
  Search, 
  Filter,
  RefreshCw,
  Settings,
  Eye,
  Brain,
  Calendar,
  Tag,
  FileText,
  BarChart3,
  Users,
  Clock,
  Link
} from 'lucide-react';
import { getApiClient } from '@/lib/api';
import GraphDisplay from '../components/GraphDisplay';
import KnowledgeGraphBreadcrumb from '@/components/KnowledgeGraphBreadcrumb';
import { useKnowledgeGraphState, getProjectDisplayName } from '@/hooks/useKnowledgeGraphState';

interface TemporalEntity {
  id: string;
  entityId: string;
  entityType: string;
  properties: Record<string, any>;
  temporalContext: {
    createdAt: string;
    lastUpdated: string;
    validFrom: string;
    validTo?: string;
  };
  metadata: Record<string, any>;
}

interface TemporalRelation {
  id: string;
  relationId: string;
  sourceEntityId: string;
  targetEntityId: string;
  relationType: string;
  strength: number;
  properties: Record<string, any>;
  temporalContext: {
    createdAt: string;
    lastUpdated: string;
    validFrom: string;
    validTo?: string;
  };
}

interface GraphStats {
  totalEntities: number;
  totalRelations: number;
  entityTypes: Record<string, number>;
  relationTypes: Record<string, number>;
  temporalRange: {
    earliest: string;
    latest: string;
  };
}

interface Project {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive" | "maintenance";
}

interface MemoryEntry {
  id: string;
  content: string;
  summary: string;
  tags: string[];
  project: string;
  createdAt: string;
  lastAccessed: string;
  accessCount: number;
  relevanceScore: number;
  type: "conversation" | "document" | "context" | "knowledge";
  size: number;
}

// 项目数据
const projects: Project[] = [
  { id: "1", name: "AI客服助手", description: "智能客服系统", status: "active" },
  { id: "2", name: "内容生成器", description: "AI内容创作工具", status: "active" },
  { id: "3", name: "数据分析平台", description: "企业数据分析", status: "maintenance" }
];

// Mock实体数据
const mockEntities = [
  {
    id: "1",
    name: "AI模型训练",
    type: "technology",
    description: "机器学习模型训练相关技术",
    confidence: 0.92,
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-16T14:20:00Z"
  },
  {
    id: "2",
    name: "深度学习",
    type: "technology",
    description: "深度神经网络技术",
    confidence: 0.87,
    createdAt: "2024-01-14T09:15:00Z",
    updatedAt: "2024-01-16T11:45:00Z"
  },
  {
    id: "3",
    name: "性能优化",
    type: "technology",
    description: "系统性能优化技术",
    confidence: 0.78,
    createdAt: "2024-01-13T16:45:00Z",
    updatedAt: "2024-01-15T13:30:00Z"
  }
];

// Mock关系数据
const mockRelations = [
  {
    id: "1",
    source: "1",
    target: "2",
    type: "relates_to",
    description: "AI模型训练与深度学习相关",
    confidence: 0.85,
    strength: 0.8,
    createdAt: "2024-01-15T10:30:00Z"
  },
  {
    id: "2",
    source: "2",
    target: "3",
    type: "requires",
    description: "深度学习需要性能优化",
    confidence: 0.75,
    strength: 0.7,
    createdAt: "2024-01-14T09:15:00Z"
  }
];

// 记忆数据（从Memory.tsx移植）
const mockMemories: MemoryEntry[] = [
  {
    id: "1",
    content: "用户询问关于AI模型训练的最佳实践，包括数据预处理、模型选择和超参数调优等方面的详细信息。",
    summary: "AI模型训练最佳实践咨询",
    tags: ["AI", "机器学习", "训练", "最佳实践"],
    project: "AI客服助手",
    createdAt: "2024-01-15T10:30:00Z",
    lastAccessed: "2024-01-16T14:20:00Z",
    accessCount: 15,
    relevanceScore: 0.92,
    type: "conversation",
    size: 1024
  },
  {
    id: "2",
    content: "技术文档：深度学习模型的部署策略，包括模型优化、推理加速和资源管理等关键技术点。",
    summary: "深度学习模型部署策略文档",
    tags: ["深度学习", "部署", "优化", "推理"],
    project: "内容生成器",
    createdAt: "2024-01-14T09:15:00Z",
    lastAccessed: "2024-01-16T11:45:00Z",
    accessCount: 8,
    relevanceScore: 0.87,
    type: "document",
    size: 2048
  },
  {
    id: "3",
    content: "用户反馈：系统响应速度需要优化，建议增加缓存机制和异步处理能力。",
    summary: "系统性能优化建议",
    tags: ["性能", "优化", "缓存", "异步"],
    project: "数据分析平台",
    createdAt: "2024-01-13T16:45:00Z",
    lastAccessed: "2024-01-15T13:30:00Z",
    accessCount: 12,
    relevanceScore: 0.78,
    type: "context",
    size: 512
  }
];

export default function KnowledgeGraph() {
  // 使用知识图谱状态管理hook
  const {
    filters,
    setSelectedProject,
    setSearchQuery,
    setSelectedEntityType,
    setMinConfidence,
    setLastVisitedPage
  } = useKnowledgeGraphState();

  // 解构筛选器状态
  const { selectedProject, searchQuery, selectedEntityType, minConfidence } = filters;

  // 页面数据状态
  const [entities, setEntities] = useState(mockEntities);
  const [relations, setRelations] = useState(mockRelations);
  const [memories, setMemories] = useState<MemoryEntry[]>(mockMemories);
  
  // 图谱交互状态
  const [highlightedMemoryIds, setHighlightedMemoryIds] = useState<string[]>([]);
  const [highlightedNodeIds, setHighlightedNodeIds] = useState<string[]>([]);
  const [selectedTab, setSelectedTab] = useState("graph");

  // 设置当前页面为最后访问页面
  useEffect(() => {
    setLastVisitedPage('/knowledge-graph');
  }, [setLastVisitedPage]);

  // 根据项目筛选数据
  const filteredMemories = memories.filter(memory => 
    selectedProject === "all" || memory.project === selectedProject
  );

  const filteredEntities = entities.filter(entity => {
    const projectMatch = selectedProject === "all" || 
      filteredMemories.some(memory => 
        memory.tags.includes(entity.name) || 
        memory.summary.includes(entity.name)
      );
    const typeMatch = selectedEntityType === "all" || entity.type === selectedEntityType;
    const confidenceMatch = entity.confidence >= minConfidence;
    const searchMatch = searchQuery === "" || 
      entity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entity.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return projectMatch && typeMatch && confidenceMatch && searchMatch;
  });

  const filteredRelations = relations.filter(relation => {
    const sourceExists = filteredEntities.some(e => e.id === relation.source);
    const targetExists = filteredEntities.some(e => e.id === relation.target);
    const confidenceMatch = relation.confidence >= minConfidence;
    
    return sourceExists && targetExists && confidenceMatch;
  });

  // 动态生成图谱数据（整合记忆管理功能）
  const generateIntegratedGraphData = () => {
    const nodes: any[] = [];
    const edges: any[] = [];

    // 添加Zep Graphiti实体节点
    filteredEntities.forEach(entity => {
      nodes.push({
        id: entity.id,
        label: entity.name,
        type: entity.type,
        confidence: entity.confidence,
        memoryIds: []
      });
    });

    // 添加Zep Graphiti关系边
    filteredRelations.forEach(relation => {
      edges.push({
        source: relation.source,
        target: relation.target,
        type: relation.type,
        confidence: relation.confidence
      });
    });

    // 整合记忆管理的图谱数据
    filteredMemories.forEach((memory) => {
      // 主概念节点
      const conceptNode = {
        id: `memory_concept_${memory.id}`,
        label: memory.summary,
        type: "memory_concept",
        memoryIds: [memory.id],
        confidence: memory.relevanceScore
      };
      nodes.push(conceptNode);

      // 基于标签生成实体节点并连接到现有实体
      memory.tags.forEach((tag) => {
        const existingEntity = filteredEntities.find(e => 
          e.name.toLowerCase() === tag.toLowerCase()
        );
        
        if (existingEntity) {
          // 连接到现有实体
          edges.push({
            source: conceptNode.id,
            target: existingEntity.id,
            type: "relates_to",
            confidence: memory.relevanceScore
          });
        } else {
          // 创建新的标签实体
          const tagNode = {
            id: `memory_tag_${memory.id}_${tag}`,
            label: tag,
            type: "memory_tag",
            memoryIds: [memory.id],
            confidence: memory.relevanceScore
          };
          nodes.push(tagNode);
          
          edges.push({
            source: conceptNode.id,
            target: tagNode.id,
            type: "tagged_with",
            confidence: memory.relevanceScore
          });
        }
      });
    });

    return { nodes, edges };
  };

  const graphData = generateIntegratedGraphData();

  // 处理图谱节点点击
  const handleNodeClick = (nodeId: string, memoryIds: string[]) => {
    setHighlightedMemoryIds(memoryIds);
    setHighlightedNodeIds([nodeId]);
  };

  // 处理记忆项目选择
  const handleMemorySelect = (memoryId: string) => {
    const relatedNodes = graphData.nodes.filter(node => 
      node.memoryIds && node.memoryIds.includes(memoryId)
    );
    setHighlightedNodeIds(relatedNodes.map(node => node.id));
    setHighlightedMemoryIds([memoryId]);
  };

  // 统计信息
  const stats = {
    totalEntities: filteredEntities.length,
    totalRelations: filteredRelations.length,
    totalMemories: filteredMemories.length,
    avgConfidence: filteredEntities.length > 0 
      ? (filteredEntities.reduce((sum, e) => sum + e.confidence, 0) / filteredEntities.length * 100).toFixed(1)
      : "0"
  };

  return (
    <div className="space-y-6">
      {/* 页面标题和项目选择 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">知识图谱</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            整合记忆管理和Zep Graphiti的时序知识图谱
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={selectedProject} onValueChange={setSelectedProject}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="选择项目" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">所有项目</SelectItem>
                        {projects.map(project => (
                          <SelectItem key={project.id} value={project.name}>
                            {project.name}
                          </SelectItem>
                        ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新图谱
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Network className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">实体数量</p>
                <p className="text-2xl font-bold">{stats.totalEntities}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">关系数量</p>
                <p className="text-2xl font-bold">{stats.totalRelations}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">记忆数量</p>
                <p className="text-2xl font-bold">{stats.totalMemories}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-orange-600" />
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
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索实体、关系..."
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
                <SelectItem value="person">人员</SelectItem>
                <SelectItem value="project">项目</SelectItem>
                <SelectItem value="technology">技术</SelectItem>
                <SelectItem value="location">位置</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">置信度:</span>
              <Input
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={minConfidence}
                onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
                className="w-20"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 主要内容区域 */}
      <Tabs defaultValue="graph" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="graph">图谱视图</TabsTrigger>
            <TabsTrigger value="entities">实体列表</TabsTrigger>
            <TabsTrigger value="relations">关系列表</TabsTrigger>
            <TabsTrigger value="memories">记忆列表</TabsTrigger>
          </TabsList>

        {/* 图谱视图 */}
        <TabsContent value="graph">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Network className="h-5 w-5 mr-2" />
                整合知识图谱
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 border rounded-lg bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <GraphDisplay 
                  graphData={graphData}
                  selectedMemoryIds={highlightedMemoryIds}
                  highlightedNodeIds={highlightedNodeIds}
                  onNodeClick={handleNodeClick}
                />
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                整合了Zep Graphiti实体关系和记忆管理数据的知识图谱。
                蓝色节点：Zep实体，绿色节点：记忆概念，橙色节点：记忆标签
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 实体列表 */}
        <TabsContent value="entities">
          <Card>
            <CardHeader>
              <CardTitle>实体列表</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredEntities.map((entity) => (
                  <div key={entity.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{entity.name}</h3>
                          <Badge variant="secondary">{entity.type}</Badge>
                          <Badge variant="outline">
                            置信度: {(entity.confidence * 100).toFixed(1)}%
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{entity.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                          <span>创建: {new Date(entity.createdAt).toLocaleDateString()}</span>
                          <span>更新: {new Date(entity.updatedAt).toLocaleDateString()}</span>
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
        </TabsContent>

        {/* 关系列表 */}
        <TabsContent value="relations">
          <Card>
            <CardHeader>
              <CardTitle>关系列表</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredRelations.map((relation) => (
                  <div key={relation.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">
                            {entities.find(e => e.id === relation.source)?.name}
                          </span>
                          <span className="text-muted-foreground">→</span>
                          <Badge variant="secondary">{relation.type}</Badge>
                          <span className="text-muted-foreground">→</span>
                          <span className="font-medium">
                            {entities.find(e => e.id === relation.target)?.name}
                          </span>
                          <Badge variant="outline">
                            {(relation.confidence * 100).toFixed(1)}%
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{relation.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                          <span>创建: {new Date(relation.createdAt).toLocaleDateString()}</span>
                          <span>强度: {relation.strength}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 记忆列表 */}
        <TabsContent value="memories">
          <Card>
            <CardHeader>
              <CardTitle>相关记忆</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredMemories.map((memory) => (
                  <div 
                    key={memory.id} 
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      highlightedMemoryIds.includes(memory.id) 
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => handleMemorySelect(memory.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{memory.summary}</h3>
                          <Badge variant="secondary">{memory.type}</Badge>
                          <Badge variant="outline">
                            相关性: {(memory.relevanceScore * 100).toFixed(1)}%
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{memory.content}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(memory.createdAt).toLocaleDateString()}
                            </span>
                            <span className="flex items-center">
                              <Eye className="w-3 h-3 mr-1" />
                              {memory.accessCount} 次访问
                            </span>
                            <span>{memory.project}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            {memory.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                              >
                                <Tag className="w-2 h-2 mr-1" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}