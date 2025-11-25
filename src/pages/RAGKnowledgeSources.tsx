import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit, 
  Trash2, 
  TestTube, 
  Database, 
  FileText, 
  Cloud,
  HardDrive,
  Globe,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useRAGStore } from '@/stores/rag-store';

interface Project {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive" | "maintenance";
  createdAt: string;
  lastActivity: string;
  memoryCount: number;
  requestCount: number;
  owner: string;
}

interface KnowledgeSource {
  id: string;
  name: string;
  type: string;
  config: Record<string, any>;
  priority: number;
  enabled: boolean;
  projectId: string;
  projectName?: string;
  lastSync?: string;
  documentCount?: number;
  status?: 'connected' | 'disconnected' | 'testing';
}

interface SourceType {
  type: string;
  name: string;
  description: string;
  configFields: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
}

// 模拟项目数据
const mockProjects: Project[] = [
  {
    id: '1',
    name: 'AI客服助手',
    description: '智能客服系统，提供24/7客户支持',
    status: 'active',
    createdAt: '2024-01-15',
    lastActivity: '2分钟前',
    memoryCount: 450,
    requestCount: 1250,
    owner: '张三'
  },
  {
    id: '2', 
    name: '内容生成器',
    description: '基于AI的内容创作和优化工具',
    status: 'active',
    createdAt: '2024-01-10',
    lastActivity: '1小时前',
    memoryCount: 320,
    requestCount: 890,
    owner: '李四'
  }
];

export default function RAGKnowledgeSources() {
  const { selectedProjectId, setSelectedProjectId } = useRAGStore();
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [sourceTypes, setSourceTypes] = useState<SourceType[]>([]);
  const [projects] = useState<Project[]>(mockProjects);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingSource, setEditingSource] = useState<KnowledgeSource | null>(null);
  const [testingSources, setTestingSources] = useState<Set<string>>(new Set());

  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    priority: 5,
    enabled: true,
    projectId: selectedProjectId || 'default',
    config: {} as Record<string, any>
  });

  // 获取知识源列表
  const fetchSources = async () => {
    try {
      console.log('Fetching sources...');
      const token = localStorage.getItem('token');
      console.log('Token:', token ? 'Present' : 'Missing');
      
      // 模拟数据用于测试UI
      const mockSources: KnowledgeSource[] = [
        {
          id: '1',
          name: 'Elasticsearch测试源',
          type: 'elasticsearch',
          config: { host: 'localhost:9200', index: 'test' },
          priority: 8,
          enabled: true,
          projectId: '1',
          projectName: 'AI客服助手',
          status: 'connected',
          documentCount: 1250,
          lastSync: new Date().toISOString()
        },
        {
          id: '2',
          name: 'ChromaDB向量化存储',
          type: 'chroma',
          config: { host: 'localhost:8000', collection: 'memories' },
          priority: 6,
          enabled: true,
          projectId: '2',
          projectName: '内容生成器',
          status: 'disconnected',
          documentCount: 0
        }
      ];
      
      // 由于后端有语法错误，使用模拟数据
      console.log('Using mock data due to backend issues');
      setSources(mockSources);
      setLoading(false);
      
      /* 原始API调用代码 - 暂时禁用
      const response = await fetch('/api/v1/rag-knowledge/sources', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        setSources(data.data);
      } else {
        console.error('API error:', data.message);
        toast.error(data.message || '获取知识源失败');
      }
      */
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('获取知识源失败');
      setLoading(false);
    }
  };

  // 获取支持的源类型
  const fetchSourceTypes = async () => {
    try {
      // 模拟源类型数据
      const mockSourceTypes: SourceType[] = [
        {
          type: 'elasticsearch',
          name: 'Elasticsearch',
          description: '分布式搜索和分析引擎',
          configFields: [
            { name: 'host', type: 'string', required: true, description: 'Elasticsearch主机地址' },
            { name: 'index', type: 'string', required: true, description: '索引名称' },
            { name: 'username', type: 'string', required: false, description: '用户名' },
            { name: 'password', type: 'password', required: false, description: '密码' }
          ]
        },
        {
          type: 'chroma',
          name: 'ChromaDB',
          description: '向量数据库',
          configFields: [
            { name: 'host', type: 'string', required: true, description: 'ChromaDB主机地址' },
            { name: 'collection', type: 'string', required: true, description: '集合名称' }
          ]
        },
        {
          type: 'weaviate',
          name: 'Weaviate',
          description: '向量搜索引擎',
          configFields: [
            { name: 'host', type: 'string', required: true, description: 'Weaviate主机地址' },
            { name: 'class', type: 'string', required: true, description: '类名称' }
          ]
        },
        {
          type: 'local_files',
          name: '本地文件',
          description: '本地文件系统',
          configFields: [
            { name: 'path', type: 'string', required: true, description: '文件路径' }
          ]
        },
        {
          type: 'api',
          name: 'API接口',
          description: 'REST API接口',
          configFields: [
            { name: 'url', type: 'string', required: true, description: 'API地址' },
            { name: 'headers', type: 'string', required: false, description: '请求头(JSON格式)' }
          ]
        }
      ];
      
      console.log('Using mock source types');
      setSourceTypes(mockSourceTypes);
      
      /* 原始API调用代码 - 暂时禁用
      const response = await fetch('/api/v1/rag-knowledge/source-types', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setSourceTypes(data.data);
      }
      */
    } catch (error) {
      console.error('Fetch source types error:', error);
      toast.error('获取源类型失败');
    }
  };

  useEffect(() => {
    console.log('RAGKnowledgeSources component mounted');
    console.log('Current sources:', sources);
    console.log('Loading state:', loading);
    fetchSources();
    fetchSourceTypes();
  }, []);

  // 获取源类型图标
  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'elasticsearch':
        return <Database className="h-4 w-4" />;
      case 'chroma':
      case 'weaviate':
        return <Cloud className="h-4 w-4" />;
      case 'local_files':
        return <HardDrive className="h-4 w-4" />;
      case 'api':
        return <Globe className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // 获取状态颜色
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'connected':
        return 'text-green-600 bg-green-100';
      case 'disconnected':
        return 'text-red-600 bg-red-100';
      case 'testing':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  // 测试连接
  const testConnection = async (sourceId: string) => {
    setTestingSources(prev => new Set(prev).add(sourceId));
    try {
      const response = await fetch(`/api/v1/rag-knowledge/sources/${sourceId}/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success(data.data.connected ? '连接成功' : '连接失败');
        // 更新源状态
        setSources(prev => prev.map(source => 
          source.id === sourceId 
            ? { ...source, status: data.data.connected ? 'connected' : 'disconnected' }
            : source
        ));
      }
    } catch (error) {
      toast.error('测试连接失败');
    } finally {
      setTestingSources(prev => {
        const newSet = new Set(prev);
        newSet.delete(sourceId);
        return newSet;
      });
    }
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingSource 
        ? `/api/v1/rag-knowledge/sources/${editingSource.id}`
        : '/api/v1/rag-knowledge/sources';
      
      const method = editingSource ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          id: editingSource?.id || `rag-${Date.now()}`
        })
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success(editingSource ? '更新成功' : '添加成功');
        fetchSources();
        setShowAddDialog(false);
        setEditingSource(null);
        setFormData({ name: '', type: '', priority: 5, enabled: true, projectId: selectedProjectId || 'default', config: {} });
      }
    } catch (error) {
      toast.error(editingSource ? '更新失败' : '添加失败');
    }
  };

  // 删除源
  const deleteSource = async (sourceId: string) => {
    if (!confirm('确定要删除这个知识源吗？')) return;
    
    try {
      const response = await fetch(`/api/v1/rag-knowledge/sources/${sourceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        toast.success('删除成功');
        fetchSources();
      }
    } catch (error) {
      toast.error('删除失败');
    }
  };

  // 打开编辑对话框
  const openEditDialog = (source: KnowledgeSource) => {
    setEditingSource(source);
    setFormData({
      name: source.name,
      type: source.type,
      priority: source.priority,
      enabled: source.enabled,
      projectId: source.projectId,
      config: source.config
    });
    setShowAddDialog(true);
  };

  // 获取当前选中的源类型配置字段
  const currentSourceType = sourceTypes.find(type => type.type === formData.type);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-2" />
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  console.log('Rendering main component, sources:', sources, 'loading:', loading);
  
  // 根据选中的项目过滤知识源
  const filteredSources = selectedProjectId === 'default' 
    ? sources 
    : sources.filter(source => source.projectId === selectedProjectId);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">RAG知识源管理</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            管理外部知识库，增强记忆系统的检索能力
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="选择项目" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">所有项目</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            添加知识源
          </Button>
        </div>
      </div>

      {/* 统计信息 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总知识源</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredSources.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">启用中</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredSources.filter(s => s.enabled).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">文档总数</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredSources.reduce((sum, s) => sum + (s.documentCount || 0), 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已连接</CardTitle>
            <div className="h-4 w-4 text-green-500">●</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredSources.filter(s => s.status === 'connected').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 知识源列表 */}
      <Card>
        <CardHeader>
          <CardTitle>知识源列表</CardTitle>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            配置和管理您的外部知识库连接
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredSources.map((source) => (
              <div key={source.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    {getSourceIcon(source.type)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">{source.name}</h3>
                      <Badge variant="outline">{source.type}</Badge>
                      {source.projectName && (
                        <Badge variant="secondary">{source.projectName}</Badge>
                      )}
                      <Badge 
                        variant={source.enabled ? "default" : "secondary"}
                        className={source.enabled ? "bg-green-500" : ""}
                      >
                        {source.enabled ? '启用' : '禁用'}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                      <span>优先级: {source.priority}/10</span>
                      {source.documentCount && (
                        <span>{source.documentCount} 文档</span>
                      )}
                      {source.lastSync && (
                        <span>最后同步: {new Date(source.lastSync).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {source.status && (
                    <Badge className={getStatusColor(source.status)}>
                      {source.status === 'connected' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {source.status === 'disconnected' && <XCircle className="h-3 w-3 mr-1" />}
                      {source.status === 'testing' && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                      {source.status}
                    </Badge>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testConnection(source.id)}
                    disabled={testingSources.has(source.id)}
                  >
                    <TestTube className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(source)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteSource(source.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {filteredSources.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                <p>暂无知识源，点击上方"添加知识源"按钮开始配置</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 添加/编辑对话框 */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {editingSource ? '编辑知识源' : '添加知识源'}
              </CardTitle>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                配置外部知识库连接信息
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">名称 *</label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                      placeholder="例如：技术文档库"
                    />
                  </div>
                  <div>
                    <label htmlFor="project" className="block text-sm font-medium mb-2">关联项目 *</label>
                    <Select
                      value={formData.projectId}
                      onValueChange={(value) => {
                        setFormData(prev => ({ ...prev, projectId: value }));
                        setSelectedProjectId(value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择关联项目" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium mb-2">类型 *</label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, type: value, config: {} }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择知识源类型" />
                      </SelectTrigger>
                      <SelectContent>
                        {sourceTypes.map((type) => (
                          <SelectItem key={type.type} value={type.type}>
                            <div className="flex items-center space-x-2">
                              {getSourceIcon(type.type)}
                              <span>{type.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium mb-2">优先级</label>
                    <Input
                      id="priority"
                      type="number"
                      min="1"
                      max="10"
                      value={formData.priority}
                      onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="enabled"
                      checked={formData.enabled}
                      onChange={(e) => setFormData(prev => ({ ...prev, enabled: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="enabled" className="text-sm font-medium">启用</label>
                  </div>
                </div>

                {/* 配置字段 */}
                {currentSourceType && (
                  <div className="space-y-4 p-4 border rounded-lg">
                    <h4 className="font-medium">{currentSourceType.name} 配置</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {currentSourceType.description}
                    </p>
                    {currentSourceType.configFields.map((field) => (
                      <div key={field.name}>
                        <label htmlFor={field.name} className="block text-sm font-medium mb-2">
                          {field.name} {field.required && <span className="text-red-500">*</span>}
                        </label>
                        <Input
                          id={field.name}
                          value={formData.config[field.name] || ''}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            config: { ...prev.config, [field.name]: e.target.value }
                          }))}
                          required={field.required}
                          placeholder={field.description}
                        />
                        <p className="text-xs text-gray-500 mt-1">{field.description}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddDialog(false);
                      setEditingSource(null);
                      setFormData({ name: '', type: '', priority: 5, enabled: true, projectId: selectedProjectId || 'default', config: {} });
                    }}
                  >
                    取消
                  </Button>
                  <Button type="submit">
                    {editingSource ? '更新' : '添加'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}