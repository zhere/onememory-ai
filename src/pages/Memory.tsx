import { useState, useRef } from "react";
import { 
  Search, 
  Filter, 
  Trash2, 
  Eye, 
  Download,
  Upload,
  Brain,
  Calendar,
  Tag,
  FileText,
  BarChart3
} from "lucide-react";
import { toast } from "sonner";
import GraphDisplay from "../components/GraphDisplay";
import { getApiClient } from "@/lib/api";

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
  size: number; // in bytes
}

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

export default function Memory() {
  const [memories, setMemories] = useState<MemoryEntry[]>(mockMemories);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [sortBy, setSortBy] = useState("relevance");
  const [selectedMemories, setSelectedMemories] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const apiClient = getApiClient();

  const projects = Array.from(new Set(memories.map(m => m.project)));
  const types = ["conversation", "document", "context", "knowledge"];

  const filteredMemories = memories
    .filter(memory => {
      const matchesSearch = memory.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           memory.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           memory.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesProject = selectedProject === "all" || memory.project === selectedProject;
      const matchesType = selectedType === "all" || memory.type === selectedType;
      return matchesSearch && matchesProject && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "relevance":
          return b.relevanceScore - a.relevanceScore;
        case "recent":
          return new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime();
        case "access":
          return b.accessCount - a.accessCount;
        case "size":
          return b.size - a.size;
        default:
          return 0;
      }
    });

  const getTypeColor = (type: string) => {
    switch (type) {
      case "conversation":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "document":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "context":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "knowledge":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case "conversation":
        return "对话";
      case "document":
        return "文档";
      case "context":
        return "上下文";
      case "knowledge":
        return "知识";
      default:
        return "未知";
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  const handleDeleteMemories = () => {
    setMemories(memories.filter(m => !selectedMemories.includes(m.id)));
    setSelectedMemories([]);
    toast.success(`已删除 ${selectedMemories.length} 条记忆`);
  };

  const handleExportMemories = () => {
    const exportData = memories.filter(m => selectedMemories.includes(m.id));
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'memories.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success("记忆数据已导出");
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 检查文件类型
    if (!file.name.endsWith('.json')) {
      toast.error("请选择JSON格式的文件");
      return;
    }

    setIsImporting(true);
    
    try {
      const fileContent = await file.text();
      const importData = JSON.parse(fileContent);
      
      // 验证数据格式
      if (!Array.isArray(importData)) {
        toast.error("文件格式不正确，请确保是记忆数据的JSON数组");
        return;
      }

      // 调用API导入数据
      const response = await apiClient.post('/memories/import', {
        data: importData,
        userId: 'current-user', // 实际应用中应该从认证状态获取
        projectId: selectedProject !== 'all' ? selectedProject : undefined
      });

      if (response.data.success) {
        // 更新本地状态
        const newMemories = importData.map((item: any, index: number) => ({
          id: `imported-${Date.now()}-${index}`,
          content: item.content || item.summary || '导入的记忆内容',
          summary: item.summary || item.content?.substring(0, 50) + '...' || '导入的记忆',
          tags: item.tags || ['导入'],
          project: item.project || selectedProject !== 'all' ? selectedProject : '默认项目',
          createdAt: item.createdAt || new Date().toISOString(),
          lastAccessed: new Date().toISOString(),
          accessCount: item.accessCount || 0,
          relevanceScore: item.relevanceScore || 0.5,
          type: item.type || 'document' as const,
          size: item.size || JSON.stringify(item).length
        }));

        setMemories(prev => [...newMemories, ...prev]);
        toast.success(`成功导入 ${newMemories.length} 条记忆数据`);
      } else {
        toast.error("导入失败，请检查数据格式");
      }
    } catch (error) {
      console.error('Import error:', error);
      if (error instanceof SyntaxError) {
        toast.error("文件格式错误，请确保是有效的JSON文件");
      } else {
        toast.error("导入失败，请稍后重试");
      }
    } finally {
      setIsImporting(false);
      // 清空文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const toggleMemorySelection = (memoryId: string) => {
    setSelectedMemories(prev => 
      prev.includes(memoryId) 
        ? prev.filter(id => id !== memoryId)
        : [...prev, memoryId]
    );
  };

  const selectAllMemories = () => {
    setSelectedMemories(filteredMemories.map(m => m.id));
  };

  const clearSelection = () => {
    setSelectedMemories([]);
  };

  // 新增状态管理
  const [highlightedMemoryIds, setHighlightedMemoryIds] = useState<string[]>([]);
  const [highlightedNodeIds, setHighlightedNodeIds] = useState<string[]>([]);

  // 动态生成图谱数据，根据当前筛选的记忆项目
  const generateGraphData = () => {
    const nodes: any[] = [];
    const edges: any[] = [];
    let nodeIdCounter = 1;

    // 为每个筛选后的记忆项目生成相关节点
    filteredMemories.forEach((memory) => {
      // 主概念节点
      const conceptNode = {
        id: `concept_${memory.id}`,
        label: memory.summary,
        type: "concept",
        memoryIds: [memory.id]
      };
      nodes.push(conceptNode);

      // 基于标签生成实体节点
      memory.tags.forEach((tag, index) => {
        const entityNode = {
          id: `entity_${memory.id}_${index}`,
          label: tag,
          type: "entity",
          memoryIds: [memory.id]
        };
        nodes.push(entityNode);

        // 连接概念节点和实体节点
        edges.push({
          source: conceptNode.id,
          target: entityNode.id,
          type: "relates_to"
        });
      });

      // 基于项目生成洞察节点
      const insightNode = {
        id: `insight_${memory.id}`,
        label: `${memory.project} 洞察`,
        type: "insight",
        memoryIds: [memory.id]
      };
      nodes.push(insightNode);

      // 连接概念节点和洞察节点
      edges.push({
        source: conceptNode.id,
        target: insightNode.id,
        type: "supports"
      });
    });

    // 查找相同项目的记忆，建立项目间的连接
    const projectGroups = filteredMemories.reduce((groups, memory) => {
      if (!groups[memory.project]) {
        groups[memory.project] = [];
      }
      groups[memory.project].push(memory);
      return groups;
    }, {} as Record<string, typeof filteredMemories>);

    Object.values(projectGroups).forEach((projectMemories) => {
      if (projectMemories.length > 1) {
        // 在同一项目的记忆之间建立连接
        for (let i = 0; i < projectMemories.length - 1; i++) {
          edges.push({
            source: `concept_${projectMemories[i].id}`,
            target: `concept_${projectMemories[i + 1].id}`,
            type: "derived_from"
          });
        }
      }
    });

    return { nodes, edges };
  };

  const graphData = generateGraphData();

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

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            记忆管理
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            管理和优化 Onememory 的智能记忆系统
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleImportClick}
            disabled={isImporting}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className={`w-4 h-4 mr-2 ${isImporting ? 'animate-spin' : ''}`} />
            {isImporting ? '导入中...' : '导入'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
          {selectedMemories.length > 0 && (
            <>
              <button
                onClick={handleExportMemories}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <Download className="w-4 h-4 mr-2" />
                导出 ({selectedMemories.length})
              </button>
              <button
                onClick={handleDeleteMemories}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                删除 ({selectedMemories.length})
              </button>
            </>
          )}
        </div>
      </div>
      {/* 新增：知识图谱展示区块 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">知识图谱展示</h2>
          <GraphDisplay 
            graphData={graphData}
            selectedMemoryIds={highlightedMemoryIds}
            highlightedNodeIds={highlightedNodeIds}
            onNodeClick={handleNodeClick}
          />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            点击图谱节点可高亮相关记忆项目，点击记忆项目可高亮相关图谱节点。
          </p>
        </div>
      {/* 统计信息 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    总记忆数
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {memories.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    平均相关性
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {(memories.reduce((sum, m) => sum + m.relevanceScore, 0) / memories.length * 100).toFixed(1)}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    总大小
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {formatSize(memories.reduce((sum, m) => sum + m.size, 0))}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Eye className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    总访问次数
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {memories.reduce((sum, m) => sum + m.accessCount, 0)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="搜索记忆内容、标签..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">所有项目</option>
              {projects.map(project => (
                <option key={project} value={project}>{project}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">所有类型</option>
              {types.map(type => (
                <option key={type} value={type}>{getTypeText(type)}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              排序方式:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="relevance">相关性</option>
              <option value="recent">最近访问</option>
              <option value="access">访问次数</option>
              <option value="size">大小</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              显示 {filteredMemories.length} 条记忆
            </span>
            {selectedMemories.length === 0 ? (
              <button
                onClick={selectAllMemories}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                全选
              </button>
            ) : (
              <button
                onClick={clearSelection}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                取消选择
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 记忆列表 */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredMemories.map((memory) => (
            <li key={memory.id}>
              <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 pt-1">
                    <input
                      type="checkbox"
                      checked={selectedMemories.includes(memory.id)}
                      onChange={() => toggleMemorySelection(memory.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  <div 
                    className={`flex-1 min-w-0 cursor-pointer rounded-md p-2 transition-colors ${
                      highlightedMemoryIds.includes(memory.id) 
                        ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => handleMemorySelect(memory.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {memory.summary}
                        </p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(memory.type)}`}>
                          {getTypeText(memory.type)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          相关性: {(memory.relevanceScore * 100).toFixed(1)}%
                        </span>
                        <button className="p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                      {memory.content}
                    </p>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(memory.createdAt)}
                        </div>
                        <div className="flex items-center">
                          <Eye className="w-3 h-3 mr-1" />
                          {memory.accessCount} 次访问
                        </div>
                        <div>
                          {formatSize(memory.size)}
                        </div>
                        <div>
                          {memory.project}
                        </div>
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
            </li>
          ))}
        </ul>
      </div>

      {filteredMemories.length === 0 && (
        <div className="text-center py-12">
          <Brain className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            没有找到记忆
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchQuery || selectedProject !== "all" || selectedType !== "all" 
              ? "尝试调整搜索条件或筛选器" 
              : "系统中还没有记忆数据"}
          </p>
        </div>
      )}
    </div>
  );
}