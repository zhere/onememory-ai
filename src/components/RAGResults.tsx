import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Brain, 
  Database, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Star,
  Filter,
  Download,
  RefreshCw,
  Eye,
  ChevronDown,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

interface RAGResult {
  id: string;
  type: 'memory' | 'knowledge';
  content: string;
  score: number;
  source: string;
  metadata: {
    originalScore: number;
    fusionWeight: number;
    timestamp: Date;
    confidence: number;
    relevance: number;
    freshness: number;
  };
  highlights?: string[];
  relatedResults?: RAGResult[];
}

interface RAGResultsProps {
  results: RAGResult[];
  loading?: boolean;
  onRefresh?: () => void;
  onExport?: (format: 'json' | 'csv') => void;
  showMetadata?: boolean;
  enableFiltering?: boolean;
  enableExport?: boolean;
}

export default function RAGResults({
  results = [],
  loading = false,
  onRefresh,
  onExport,
  showMetadata = true,
  enableFiltering = true,
  enableExport = true
}: RAGResultsProps) {
  const [filteredResults, setFilteredResults] = useState<RAGResult[]>(results);
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<'all' | 'memory' | 'knowledge'>('all');
  const [minScore, setMinScore] = useState(0);
  const [sortBy, setSortBy] = useState<'score' | 'time' | 'confidence'>('score');
  const [showSourceFilter, setShowSourceFilter] = useState(false);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);

  // 获取所有可用的数据源
  const availableSources = Array.from(new Set(results.map(r => r.source)));

  // 过滤和排序结果
  useEffect(() => {
    let filtered = results;

    // 类型过滤
    if (filterType !== 'all') {
      filtered = filtered.filter(r => r.type === filterType);
    }

    // 分数过滤
    filtered = filtered.filter(r => r.score >= minScore);

    // 数据源过滤
    if (selectedSources.length > 0) {
      filtered = filtered.filter(r => selectedSources.includes(r.source));
    }

    // 排序
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'time':
          return new Date(b.metadata.timestamp).getTime() - new Date(a.metadata.timestamp).getTime();
        case 'confidence':
          return b.metadata.confidence - a.metadata.confidence;
        case 'score':
        default:
          return b.score - a.score;
      }
    });

    setFilteredResults(filtered);
  }, [results, filterType, minScore, sortBy, selectedSources]);

  // 切换结果展开状态
  const toggleExpanded = (resultId: string) => {
    setExpandedResults(prev => {
      const newSet = new Set(prev);
      if (newSet.has(resultId)) {
        newSet.delete(resultId);
      } else {
        newSet.add(resultId);
      }
      return newSet;
    });
  };

  // 获取结果类型图标
  const getResultIcon = (type: string) => {
    return type === 'memory' ? <Brain className="h-4 w-4" /> : <Database className="h-4 w-4" />;
  };

  // 获取分数颜色
  const getScoreColor = (score: number) => {
    if (score >= 0.9) return 'text-green-600 bg-green-100';
    if (score >= 0.7) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  // 获取置信度颜色
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  // 高亮显示搜索关键词
  const highlightContent = (content: string, highlights: string[] = []) => {
    if (!highlights || highlights.length === 0) return content;
    
    let highlightedContent = content;
    highlights.forEach(highlight => {
      const regex = new RegExp(`(${highlight})`, 'gi');
      highlightedContent = highlightedContent.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>');
    });
    
    return <span dangerouslySetInnerHTML={{ __html: highlightedContent }} />;
  };

  // 格式化时间
  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}天前`;
    if (hours > 0) return `${hours}小时前`;
    if (minutes > 0) return `${minutes}分钟前`;
    return '刚刚';
  };

  // 导出结果
  const handleExport = (format: 'json' | 'csv') => {
    if (onExport) {
      onExport(format);
    } else {
      // 默认导出逻辑
      const data = filteredResults.map(r => ({
        id: r.id,
        type: r.type,
        content: r.content,
        score: r.score,
        source: r.source,
        timestamp: r.metadata.timestamp,
        confidence: r.metadata.confidence
      }));

      if (format === 'json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rag-results-${new Date().toISOString()}.json`;
        a.click();
      } else if (format === 'csv') {
        const headers = ['ID', '类型', '内容', '分数', '数据源', '时间', '置信度'];
        const rows = data.map(r => [
          r.id,
          r.type,
          `"${r.content.replace(/"/g, '""')}"`,
          r.score,
          r.source,
          formatTime(r.timestamp),
          r.metadata.confidence
        ]);
        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rag-results-${new Date().toISOString()}.csv`;
        a.click();
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* 工具栏 */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            共 {filteredResults.length} 个结果
          </div>
          {enableFiltering && (
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="all">全部类型</option>
                <option value="memory">仅记忆</option>
                <option value="knowledge">仅知识</option>
              </select>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">排序:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="score">按分数</option>
              <option value="time">按时间</option>
              <option value="confidence">按置信度</option>
            </select>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              刷新
            </Button>
          )}
          {enableExport && (
            <div className="flex space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('json')}
              >
                <Download className="h-4 w-4 mr-1" />
                JSON
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('csv')}
              >
                <Download className="h-4 w-4 mr-1" />
                CSV
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 数据源过滤器 */}
      {enableFiltering && (
        <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSourceFilter(!showSourceFilter)}
          >
            {showSourceFilter ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            数据源筛选
          </Button>
          {showSourceFilter && (
            <div className="flex flex-wrap gap-2">
              {availableSources.map(source => (
                <label key={source} className="flex items-center space-x-1">
                  <input
                    type="checkbox"
                    checked={selectedSources.includes(source)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSources(prev => [...prev, source]);
                      } else {
                        setSelectedSources(prev => prev.filter(s => s !== source));
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm">{source}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 结果列表 */}
      <div className="space-y-3">
        {filteredResults.map((result, index) => {
          const isExpanded = expandedResults.has(result.id);
          
          return (
            <Card key={result.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="flex items-center space-x-1">
                        {getResultIcon(result.type)}
                        <span>{result.type === 'memory' ? '记忆' : '知识'}</span>
                      </Badge>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {result.source}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getScoreColor(result.score)}>
                        <Star className="h-3 w-3 mr-1" />
                        {result.score.toFixed(3)}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        #{index + 1}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpanded(result.id)}
                    >
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* 主要内容 */}
                  <div className="text-gray-800 dark:text-gray-200 leading-relaxed">
                    {highlightContent(result.content, result.highlights)}
                  </div>

                  {/* 元数据信息 */}
                  {showMetadata && (
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatTime(result.metadata.timestamp)}</span>
                        </div>
                        <div className={`flex items-center space-x-1 ${getConfidenceColor(result.metadata.confidence)}`}>
                          {result.metadata.confidence >= 0.8 ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          <span>置信度: {(result.metadata.confidence * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>原始分数: {result.metadata.originalScore.toFixed(3)}</span>
                        <span>融合权重: {result.metadata.fusionWeight.toFixed(3)}</span>
                      </div>
                    </div>
                  )}

                  {/* 展开的高级信息 */}
                  {isExpanded && (
                    <div className="pt-3 border-t space-y-3">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500">相关性</div>
                          <div className="font-medium">{(result.metadata.relevance * 100).toFixed(1)}%</div>
                        </div>
                        <div>
                          <div className="text-gray-500">新鲜度</div>
                          <div className="font-medium">{(result.metadata.freshness * 100).toFixed(1)}%</div>
                        </div>
                        <div>
                          <div className="text-gray-500">数据源</div>
                          <div className="font-medium">{result.source}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">ID</div>
                          <div className="font-mono text-xs">{result.id}</div>
                        </div>
                      </div>
                      
                      {/* 相关结果 */}
                      {result.relatedResults && result.relatedResults.length > 0 && (
                        <div>
                          <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                            相关结果 ({result.relatedResults.length})
                          </div>
                          <div className="space-y-2">
                            {result.relatedResults.slice(0, 3).map((related, idx) => (
                              <div key={idx} className="p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm">
                                <div className="flex items-center justify-between mb-1">
                                  <Badge variant="outline" className="text-xs">
                                    {related.type === 'memory' ? '记忆' : '知识'}
                                  </Badge>
                                  <span className="text-xs text-gray-500">
                                    {related.score.toFixed(3)}
                                  </span>
                                </div>
                                <div className="text-gray-700 dark:text-gray-300">
                                  {related.content.substring(0, 100)}
                                  {related.content.length > 100 && '...'}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {filteredResults.length === 0 && !loading && (
          <Card>
            <CardContent className="text-center py-12">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                暂无搜索结果
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                请尝试调整搜索条件或筛选器
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}