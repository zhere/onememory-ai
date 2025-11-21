import { useState } from "react";
import { 
  Plus, 
  Key, 
  Copy, 
  Eye, 
  EyeOff, 
  Trash2, 
  Edit,
  Calendar,
  Activity,
  Shield,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";

interface ApiToken {
  id: string;
  name: string;
  token: string;
  permissions: string[];
  createdAt: string;
  lastUsed: string;
  expiresAt: string | null;
  isActive: boolean;
  usageCount: number;
  rateLimit: number;
  project: string;
}

const mockTokens: ApiToken[] = [
  {
    id: "1",
    name: "生产环境主Token",
    token: "sk-proj-abc123def456ghi789jkl012mno345pqr678stu901vwx234yz",
    permissions: ["read", "write", "admin"],
    createdAt: "2024-01-15T10:30:00Z",
    lastUsed: "2024-01-16T14:20:00Z",
    expiresAt: "2024-12-31T23:59:59Z",
    isActive: true,
    usageCount: 1250,
    rateLimit: 1000,
    project: "AI客服助手"
  },
  {
    id: "2",
    name: "开发环境Token",
    token: "sk-dev-xyz789abc123def456ghi789jkl012mno345pqr678stu",
    permissions: ["read", "write"],
    createdAt: "2024-01-10T09:15:00Z",
    lastUsed: "2024-01-16T11:45:00Z",
    expiresAt: null,
    isActive: true,
    usageCount: 450,
    rateLimit: 500,
    project: "内容生成器"
  },
  {
    id: "3",
    name: "只读Token",
    token: "sk-readonly-mno345pqr678stu901vwx234yz567abc123def456",
    permissions: ["read"],
    createdAt: "2024-01-05T16:45:00Z",
    lastUsed: "2024-01-14T13:30:00Z",
    expiresAt: "2024-06-30T23:59:59Z",
    isActive: false,
    usageCount: 89,
    rateLimit: 100,
    project: "数据分析平台"
  }
];

export default function TokenManagement() {
  const [tokens, setTokens] = useState<ApiToken[]>(mockTokens);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [visibleTokens, setVisibleTokens] = useState<Set<string>>(new Set());
  const [newToken, setNewToken] = useState({
    name: "",
    permissions: [] as string[],
    expiresAt: "",
    rateLimit: 1000,
    project: ""
  });

  const permissions = [
    { id: "read", name: "读取", description: "查看数据和配置" },
    { id: "write", name: "写入", description: "创建和修改数据" },
    { id: "admin", name: "管理", description: "完全管理权限" }
  ];

  const projects = Array.from(new Set(tokens.map(t => t.project)));

  const toggleTokenVisibility = (tokenId: string) => {
    setVisibleTokens(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tokenId)) {
        newSet.delete(tokenId);
      } else {
        newSet.add(tokenId);
      }
      return newSet;
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Token已复制到剪贴板");
  };

  const maskToken = (token: string) => {
    if (token.length <= 8) return token;
    return token.substring(0, 8) + "..." + token.substring(token.length - 8);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  const getPermissionColor = (permission: string) => {
    switch (permission) {
      case "read":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "write":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getPermissionText = (permission: string) => {
    const perm = permissions.find(p => p.id === permission);
    return perm ? perm.name : permission;
  };

  const isTokenExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const isTokenExpiringSoon = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    const expiry = new Date(expiresAt);
    const now = new Date();
    const daysUntilExpiry = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const handleCreateToken = () => {
    if (!newToken.name.trim()) {
      toast.error("请输入Token名称");
      return;
    }
    if (newToken.permissions.length === 0) {
      toast.error("请选择至少一个权限");
      return;
    }

    const token: ApiToken = {
      id: Date.now().toString(),
      name: newToken.name,
      token: `sk-proj-${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      permissions: newToken.permissions,
      createdAt: new Date().toISOString(),
      lastUsed: "从未使用",
      expiresAt: newToken.expiresAt || null,
      isActive: true,
      usageCount: 0,
      rateLimit: newToken.rateLimit,
      project: newToken.project || "未分配"
    };

    setTokens(prev => [token, ...prev]);
    setNewToken({
      name: "",
      permissions: [],
      expiresAt: "",
      rateLimit: 1000,
      project: ""
    });
    setShowCreateModal(false);
    toast.success("Token创建成功");
  };

  const handleDeleteToken = (tokenId: string) => {
    setTokens(prev => prev.filter(t => t.id !== tokenId));
    toast.success("Token已删除");
  };

  const handleToggleToken = (tokenId: string) => {
    setTokens(prev => prev.map(t => 
      t.id === tokenId ? { ...t, isActive: !t.isActive } : t
    ));
    const token = tokens.find(t => t.id === tokenId);
    toast.success(`Token已${token?.isActive ? '禁用' : '启用'}`);
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Token管理
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            管理API访问令牌和权限控制
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          创建Token
        </button>
      </div>

      {/* 统计信息 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Key className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    总Token数
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {tokens.length}
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
                <Activity className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    活跃Token
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {tokens.filter(t => t.isActive).length}
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
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    即将过期
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {tokens.filter(t => isTokenExpiringSoon(t.expiresAt)).length}
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
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    总使用次数
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {tokens.reduce((sum, t) => sum + t.usageCount, 0).toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Token列表 */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {tokens.map((token) => (
            <li key={token.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${
                      !token.isActive ? 'bg-gray-400' :
                      isTokenExpired(token.expiresAt) ? 'bg-red-500' :
                      isTokenExpiringSoon(token.expiresAt) ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`} />
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {token.name}
                        </p>
                        {isTokenExpired(token.expiresAt) && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                            已过期
                          </span>
                        )}
                        {isTokenExpiringSoon(token.expiresAt) && !isTokenExpired(token.expiresAt) && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                            即将过期
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          创建于 {formatDate(token.createdAt)}
                        </div>
                        <div className="flex items-center">
                          <Activity className="w-3 h-3 mr-1" />
                          {token.lastUsed === "从未使用" ? "从未使用" : `最后使用 ${formatDate(token.lastUsed)}`}
                        </div>
                        <div>
                          项目: {token.project}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {token.usageCount.toLocaleString()} 次使用
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        限制: {token.rateLimit}/分钟
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Token:</span>
                      <code className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {visibleTokens.has(token.id) ? token.token : maskToken(token.token)}
                      </code>
                      <button
                        onClick={() => toggleTokenVisibility(token.id)}
                        className="p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600"
                      >
                        {visibleTokens.has(token.id) ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => copyToClipboard(token.token)}
                        className="p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleToken(token.id)}
                        className={`px-3 py-1 text-xs font-medium rounded-md ${
                          token.isActive
                            ? 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200'
                        }`}
                      >
                        {token.isActive ? '禁用' : '启用'}
                      </button>
                      <button className="p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteToken(token.id)}
                        className="p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center space-x-1">
                    <span className="text-sm text-gray-500 dark:text-gray-400">权限:</span>
                    {token.permissions.map((permission) => (
                      <span
                        key={permission}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPermissionColor(permission)}`}
                      >
                        {getPermissionText(permission)}
                      </span>
                    ))}
                  </div>

                  {token.expiresAt && (
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      过期时间: {formatDate(token.expiresAt)}
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* 创建Token模态框 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                创建新Token
              </h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Token名称
                  </label>
                  <input
                    type="text"
                    value={newToken.name}
                    onChange={(e) => setNewToken(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="输入Token名称"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    权限
                  </label>
                  <div className="space-y-2">
                    {permissions.map((permission) => (
                      <label key={permission.id} className="flex items-start">
                        <input
                          type="checkbox"
                          checked={newToken.permissions.includes(permission.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewToken(prev => ({
                                ...prev,
                                permissions: [...prev.permissions, permission.id]
                              }));
                            } else {
                              setNewToken(prev => ({
                                ...prev,
                                permissions: prev.permissions.filter(p => p !== permission.id)
                              }));
                            }
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
                        />
                        <div className="ml-2">
                          <span className="text-sm text-gray-900 dark:text-white">
                            {permission.name}
                          </span>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {permission.description}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    关联项目
                  </label>
                  <select
                    value={newToken.project}
                    onChange={(e) => setNewToken(prev => ({ ...prev, project: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">选择项目</option>
                    {projects.map(project => (
                      <option key={project} value={project}>{project}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    速率限制 (请求/分钟)
                  </label>
                  <input
                    type="number"
                    value={newToken.rateLimit}
                    onChange={(e) => setNewToken(prev => ({ ...prev, rateLimit: parseInt(e.target.value) }))}
                    min="1"
                    max="10000"
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    过期时间 (可选)
                  </label>
                  <input
                    type="datetime-local"
                    value={newToken.expiresAt}
                    onChange={(e) => setNewToken(prev => ({ ...prev, expiresAt: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-md"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateToken}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  >
                    创建Token
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}