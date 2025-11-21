import { useState } from "react";
import { 
  Save, 
  RefreshCw, 
  Shield, 
  Bell, 
  Palette, 
  Database, 
  Globe,
  Lock,
  Mail,
  Smartphone,
  AlertTriangle,
  CheckCircle,
  Info
} from "lucide-react";
import { toast } from "sonner";
import { useThemeStore } from "../stores/themeStore";

interface SettingsSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
}

const settingsSections: SettingsSection[] = [
  {
    id: "general",
    title: "常规设置",
    icon: <Globe className="w-5 h-5" />,
    description: "基本系统配置和偏好设置"
  },
  {
    id: "security",
    title: "安全设置",
    icon: <Shield className="w-5 h-5" />,
    description: "安全策略和访问控制配置"
  },
  {
    id: "notifications",
    title: "通知设置",
    icon: <Bell className="w-5 h-5" />,
    description: "系统通知和警报配置"
  },
  {
    id: "appearance",
    title: "外观设置",
    icon: <Palette className="w-5 h-5" />,
    description: "界面主题和显示偏好"
  },
  {
    id: "database",
    title: "数据库设置",
    icon: <Database className="w-5 h-5" />,
    description: "数据存储和备份配置"
  }
];

export default function Settings() {
  const [activeSection, setActiveSection] = useState("general");
  const [settings, setSettings] = useState({
    // 常规设置
    systemName: "Onememory",
    timezone: "Asia/Shanghai",
    language: "zh-CN",
    logLevel: "info",
    maxConcurrentRequests: 100,
    requestTimeout: 30000,
    
    // 安全设置
    enableAuth: true,
    requireApiKey: true,
    enableRateLimit: true,
    maxLoginAttempts: 5,
    sessionTimeout: 3600,
    enableCors: true,
    allowedOrigins: "http://localhost:3000",
    
    // 通知设置
    enableEmailNotifications: true,
    enableSmsNotifications: false,
    notifyOnErrors: true,
    notifyOnHighUsage: true,
    notifyOnSecurityEvents: true,
    emailAddress: "admin@example.com",
    phoneNumber: "",
    
    // 外观设置
    theme: "system",
    compactMode: false,
    showAnimations: true,
    
    // 数据库设置
    enableBackup: true,
    backupInterval: 24,
    retentionDays: 30,
    enableCompression: true
  });

  const { isDark, setTheme } = useThemeStore();

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    // 这里应该调用API保存设置
    toast.success("设置已保存");
  };

  const handleReset = () => {
    // 重置为默认设置
    toast.success("设置已重置为默认值");
  };

  const handleTestNotification = () => {
    toast.info("这是一条测试通知");
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          系统配置
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              系统名称
            </label>
            <input
              type="text"
              value={settings.systemName}
              onChange={(e) => handleSettingChange("systemName", e.target.value)}
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              时区
            </label>
            <select
              value={settings.timezone}
              onChange={(e) => handleSettingChange("timezone", e.target.value)}
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="Asia/Shanghai">Asia/Shanghai</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">America/New_York</option>
              <option value="Europe/London">Europe/London</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              语言
            </label>
            <select
              value={settings.language}
              onChange={(e) => handleSettingChange("language", e.target.value)}
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="zh-CN">简体中文</option>
              <option value="en-US">English</option>
              <option value="ja-JP">日本語</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              日志级别
            </label>
            <select
              value={settings.logLevel}
              onChange={(e) => handleSettingChange("logLevel", e.target.value)}
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="error">Error</option>
              <option value="warn">Warning</option>
              <option value="info">Info</option>
              <option value="debug">Debug</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          性能配置
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              最大并发请求数
            </label>
            <input
              type="number"
              value={settings.maxConcurrentRequests}
              onChange={(e) => handleSettingChange("maxConcurrentRequests", parseInt(e.target.value))}
              min="1"
              max="1000"
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              请求超时时间 (毫秒)
            </label>
            <input
              type="number"
              value={settings.requestTimeout}
              onChange={(e) => handleSettingChange("requestTimeout", parseInt(e.target.value))}
              min="1000"
              max="300000"
              step="1000"
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          身份验证
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                启用身份验证
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                要求用户登录才能访问系统
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.enableAuth}
              onChange={(e) => handleSettingChange("enableAuth", e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                要求API密钥
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                API请求必须包含有效的API密钥
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.requireApiKey}
              onChange={(e) => handleSettingChange("requireApiKey", e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                启用速率限制
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                限制每个用户的请求频率
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.enableRateLimit}
              onChange={(e) => handleSettingChange("enableRateLimit", e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          安全策略
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              最大登录尝试次数
            </label>
            <input
              type="number"
              value={settings.maxLoginAttempts}
              onChange={(e) => handleSettingChange("maxLoginAttempts", parseInt(e.target.value))}
              min="1"
              max="10"
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              会话超时时间 (秒)
            </label>
            <input
              type="number"
              value={settings.sessionTimeout}
              onChange={(e) => handleSettingChange("sessionTimeout", parseInt(e.target.value))}
              min="300"
              max="86400"
              step="300"
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          CORS设置
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                启用CORS
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                允许跨域请求
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.enableCors}
              onChange={(e) => handleSettingChange("enableCors", e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              允许的源地址
            </label>
            <textarea
              value={settings.allowedOrigins}
              onChange={(e) => handleSettingChange("allowedOrigins", e.target.value)}
              rows={3}
              placeholder="每行一个地址，如：http://localhost:3000"
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          通知方式
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Mail className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  邮件通知
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  通过邮件接收系统通知
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.enableEmailNotifications}
              onChange={(e) => handleSettingChange("enableEmailNotifications", e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Smartphone className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  短信通知
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  通过短信接收重要通知
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.enableSmsNotifications}
              onChange={(e) => handleSettingChange("enableSmsNotifications", e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          通知类型
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-3" />
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  错误通知
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  系统错误和异常通知
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.notifyOnErrors}
              onChange={(e) => handleSettingChange("notifyOnErrors", e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Info className="w-5 h-5 text-blue-500 mr-3" />
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  高使用率通知
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  系统资源使用率过高时通知
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.notifyOnHighUsage}
              onChange={(e) => handleSettingChange("notifyOnHighUsage", e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="w-5 h-5 text-yellow-500 mr-3" />
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  安全事件通知
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  安全相关事件通知
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.notifyOnSecurityEvents}
              onChange={(e) => handleSettingChange("notifyOnSecurityEvents", e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          联系方式
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              邮箱地址
            </label>
            <input
              type="email"
              value={settings.emailAddress}
              onChange={(e) => handleSettingChange("emailAddress", e.target.value)}
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              手机号码
            </label>
            <input
              type="tel"
              value={settings.phoneNumber}
              onChange={(e) => handleSettingChange("phoneNumber", e.target.value)}
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={handleTestNotification}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Bell className="w-4 h-4 mr-2" />
            发送测试通知
          </button>
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          主题设置
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              主题模式
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "light", label: "浅色", icon: "☀️" },
                { value: "dark", label: "深色", icon: "🌙" },
                { value: "system", label: "跟随系统", icon: "💻" }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    if (option.value === "dark") {
                      setTheme(true);
                    } else if (option.value === "light") {
                      setTheme(false);
                    }
                    handleSettingChange("theme", option.value);
                  }}
                  className={`p-3 rounded-lg border-2 text-center transition-colors ${
                    settings.theme === option.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="text-2xl mb-1">{option.icon}</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {option.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                紧凑模式
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                减少界面元素间距，显示更多内容
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.compactMode}
              onChange={(e) => handleSettingChange("compactMode", e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                显示动画
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                启用界面过渡动画效果
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.showAnimations}
              onChange={(e) => handleSettingChange("showAnimations", e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderDatabaseSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          备份设置
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                启用自动备份
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                定期自动备份数据库
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.enableBackup}
              onChange={(e) => handleSettingChange("enableBackup", e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                备份间隔 (小时)
              </label>
              <input
                type="number"
                value={settings.backupInterval}
                onChange={(e) => handleSettingChange("backupInterval", parseInt(e.target.value))}
                min="1"
                max="168"
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                保留天数
              </label>
              <input
                type="number"
                value={settings.retentionDays}
                onChange={(e) => handleSettingChange("retentionDays", parseInt(e.target.value))}
                min="1"
                max="365"
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                启用压缩
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                压缩备份文件以节省存储空间
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.enableCompression}
              onChange={(e) => handleSettingChange("enableCompression", e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          数据管理
        </h3>
        <div className="space-y-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  危险操作
                </h3>
                <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                  <p>以下操作将永久删除数据，请谨慎操作。</p>
                </div>
                <div className="mt-4 space-x-3">
                  <button className="bg-yellow-100 dark:bg-yellow-900 px-3 py-2 text-sm font-medium text-yellow-800 dark:text-yellow-200 rounded-md hover:bg-yellow-200 dark:hover:bg-yellow-800">
                    清理过期数据
                  </button>
                  <button className="bg-red-100 dark:bg-red-900 px-3 py-2 text-sm font-medium text-red-800 dark:text-red-200 rounded-md hover:bg-red-200 dark:hover:bg-red-800">
                    重置所有数据
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "general":
        return renderGeneralSettings();
      case "security":
        return renderSecuritySettings();
      case "notifications":
        return renderNotificationSettings();
      case "appearance":
        return renderAppearanceSettings();
      case "database":
        return renderDatabaseSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="flex h-full">
      {/* 侧边栏 */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="p-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            系统设置
          </h2>
        </div>
        <nav className="mt-4">
          {settingsSections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full text-left px-4 py-3 flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                activeSection === section.id
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-r-2 border-blue-500 text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {section.icon}
              <div>
                <div className="text-sm font-medium">{section.title}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {section.description}
                </div>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="max-w-4xl">
            {renderContent()}

            {/* 操作按钮 */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleReset}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  重置
                </button>
                <button
                  onClick={handleSave}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Save className="w-4 h-4 mr-2" />
                  保存设置
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}