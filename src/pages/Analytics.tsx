import { useState } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Users, 
  Clock, 
  Zap,
  Calendar,
  Filter,
  Download,
  RefreshCw
} from "lucide-react";

// 模拟数据
const requestTrendData = [
  { date: "01-10", requests: 1200, success: 1150, errors: 50 },
  { date: "01-11", requests: 1350, success: 1300, errors: 50 },
  { date: "01-12", requests: 1100, success: 1080, errors: 20 },
  { date: "01-13", requests: 1450, success: 1400, errors: 50 },
  { date: "01-14", requests: 1600, success: 1550, errors: 50 },
  { date: "01-15", requests: 1800, success: 1750, errors: 50 },
  { date: "01-16", requests: 2100, success: 2050, errors: 50 }
];

const modelUsageData = [
  { name: "GPT-4", value: 45, color: "#3B82F6" },
  { name: "GPT-3.5", value: 30, color: "#10B981" },
  { name: "Claude", value: 15, color: "#F59E0B" },
  { name: "Gemini", value: 10, color: "#EF4444" }
];

const responseTimeData = [
  { time: "00:00", avgTime: 120, p95Time: 250 },
  { time: "04:00", avgTime: 110, p95Time: 230 },
  { time: "08:00", avgTime: 180, p95Time: 350 },
  { time: "12:00", avgTime: 220, p95Time: 450 },
  { time: "16:00", avgTime: 200, p95Time: 400 },
  { time: "20:00", avgTime: 150, p95Time: 300 },
  { time: "24:00", avgTime: 130, p95Time: 270 }
];

const memoryUsageData = [
  { date: "01-10", used: 2.1, total: 10 },
  { date: "01-11", used: 2.3, total: 10 },
  { date: "01-12", used: 2.0, total: 10 },
  { date: "01-13", used: 2.5, total: 10 },
  { date: "01-14", used: 2.8, total: 10 },
  { date: "01-15", used: 3.2, total: 10 },
  { date: "01-16", used: 3.5, total: 10 }
];

const topProjectsData = [
  { name: "AI客服助手", requests: 8500, growth: 12.5 },
  { name: "内容生成器", requests: 6200, growth: -3.2 },
  { name: "数据分析平台", requests: 4800, growth: 8.7 },
  { name: "智能翻译", requests: 3600, growth: 15.3 },
  { name: "代码助手", requests: 2900, growth: -1.8 }
];

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("7d");
  const [selectedMetric, setSelectedMetric] = useState("requests");

  const timeRanges = [
    { value: "1d", label: "今天" },
    { value: "7d", label: "7天" },
    { value: "30d", label: "30天" },
    { value: "90d", label: "90天" }
  ];

  const metrics = [
    { value: "requests", label: "请求量" },
    { value: "response_time", label: "响应时间" },
    { value: "memory", label: "内存使用" },
    { value: "errors", label: "错误率" }
  ];

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const formatBytes = (bytes: number) => {
    if (bytes >= 1024 * 1024 * 1024) {
      return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
    }
    if (bytes >= 1024 * 1024) {
      return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    }
    if (bytes >= 1024) {
      return (bytes / 1024).toFixed(1) + " KB";
    }
    return bytes + " B";
  };

  return (
    <div className="space-y-6">
      {/* 页面标题和控制 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            数据分析
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            系统使用情况和性能指标分析
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {timeRanges.map(range => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
          <button className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </button>
          <button className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <Download className="w-4 h-4 mr-2" />
            导出
          </button>
        </div>
      </div>

      {/* 关键指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    总请求数
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {formatNumber(10800)}
                    </div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      12.5%
                    </div>
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
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    平均响应时间
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                      165ms
                    </div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                      <TrendingDown className="w-4 h-4 mr-1" />
                      8.2%
                    </div>
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
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    活跃项目
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                      24
                    </div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      4.2%
                    </div>
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
                    成功率
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                      99.2%
                    </div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      0.3%
                    </div>
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
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              请求趋势
            </h3>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded-md py-1 px-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {metrics.map(metric => (
                <option key={metric.value} value={metric.value}>
                  {metric.label}
                </option>
              ))}
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={requestTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="requests" 
                stackId="1"
                stroke="#3B82F6" 
                fill="#3B82F6" 
                fillOpacity={0.6}
                name="总请求"
              />
              <Area 
                type="monotone" 
                dataKey="success" 
                stackId="2"
                stroke="#10B981" 
                fill="#10B981" 
                fillOpacity={0.6}
                name="成功请求"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 模型使用分布 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            模型使用分布
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={modelUsageData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {modelUsageData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 响应时间趋势 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            响应时间趋势
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={responseTimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="avgTime" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="平均响应时间 (ms)"
              />
              <Line 
                type="monotone" 
                dataKey="p95Time" 
                stroke="#EF4444" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="P95响应时间 (ms)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 内存使用情况 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            内存使用情况
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={memoryUsageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  `${value} GB`,
                  name === "used" ? "已使用" : "总容量"
                ]}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="total" 
                stackId="1"
                stroke="#E5E7EB" 
                fill="#E5E7EB" 
                name="总容量"
              />
              <Area 
                type="monotone" 
                dataKey="used" 
                stackId="2"
                stroke="#8B5CF6" 
                fill="#8B5CF6" 
                name="已使用"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 项目排行榜 */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            项目使用排行
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            按请求量排序的项目使用情况
          </p>
        </div>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {topProjectsData.map((project, index) => (
            <li key={project.name}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-200">
                          {index + 1}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {project.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {formatNumber(project.requests)} 请求
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className={`flex items-center text-sm font-medium ${
                      project.growth >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {project.growth >= 0 ? (
                        <TrendingUp className="w-4 h-4 mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 mr-1" />
                      )}
                      {Math.abs(project.growth)}%
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}