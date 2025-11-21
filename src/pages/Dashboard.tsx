import { useState, useEffect } from "react";
import { 
  Activity, 
  Users, 
  Database, 
  Zap, 
  TrendingUp, 
  Clock,
  Server,
  Brain
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

// 模拟数据
const statsData = [
  { name: "00:00", requests: 120, memory: 85 },
  { name: "04:00", requests: 98, memory: 78 },
  { name: "08:00", requests: 180, memory: 92 },
  { name: "12:00", requests: 250, memory: 95 },
  { name: "16:00", requests: 320, memory: 88 },
  { name: "20:00", requests: 280, memory: 90 },
];

const memoryUsageData = [
  { name: "项目A", usage: 45 },
  { name: "项目B", usage: 32 },
  { name: "项目C", usage: 28 },
  { name: "项目D", usage: 15 },
];

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProjects: 12,
    activeConnections: 45,
    memoryEntries: 1250,
    requestsToday: 3420,
    avgResponseTime: 125,
    systemUptime: "99.9%"
  });

  const [recentActivity] = useState([
    { id: 1, action: "新建项目", project: "AI助手项目", time: "2分钟前", type: "create" },
    { id: 2, action: "更新配置", project: "数据分析项目", time: "5分钟前", type: "update" },
    { id: 3, action: "记忆优化", project: "客服机器人", time: "10分钟前", type: "optimize" },
    { id: 4, action: "Token刷新", project: "内容生成器", time: "15分钟前", type: "token" },
  ]);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            仪表板
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Onememory 系统概览和实时监控
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <Clock className="w-4 h-4" />
          <span>最后更新: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Database className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    总项目数
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {stats.totalProjects}
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
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    活跃连接
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {stats.activeConnections}
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
                <Brain className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    记忆条目
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {stats.memoryEntries.toLocaleString()}
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
                <Zap className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    今日请求
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {stats.requestsToday.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 请求趋势图 */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              请求趋势
            </h3>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={statsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="requests" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 记忆使用情况 */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              记忆使用情况
            </h3>
            <Brain className="h-5 w-5 text-purple-500" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={memoryUsageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="usage" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 系统状态和最近活动 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 系统状态 */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            系统状态
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Server className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-sm text-gray-600 dark:text-gray-300">系统运行时间</span>
              </div>
              <span className="text-sm font-medium text-green-600">{stats.systemUptime}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Activity className="h-5 w-5 text-blue-500 mr-2" />
                <span className="text-sm text-gray-600 dark:text-gray-300">平均响应时间</span>
              </div>
              <span className="text-sm font-medium text-blue-600">{stats.avgResponseTime}ms</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Database className="h-5 w-5 text-purple-500 mr-2" />
                <span className="text-sm text-gray-600 dark:text-gray-300">数据库状态</span>
              </div>
              <span className="text-sm font-medium text-green-600">正常</span>
            </div>
          </div>
        </div>

        {/* 最近活动 */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            最近活动
          </h3>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'create' ? 'bg-green-500' :
                  activity.type === 'update' ? 'bg-blue-500' :
                  activity.type === 'optimize' ? 'bg-purple-500' :
                  'bg-yellow-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white">
                    <span className="font-medium">{activity.action}</span>
                    <span className="text-gray-500 dark:text-gray-400"> - {activity.project}</span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}