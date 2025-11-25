import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  FolderOpen, 
  Settings, 
  Database, 
  Scissors, 
  Key, 
  BarChart3, 
  FileText,
  Brain,
  Network,
  Clock,
  GitBranch,
  Merge,
  ChevronDown,
  ChevronRight,
  Search,
  BookOpen
} from "lucide-react";
import { useState } from "react";
import { useRAGStore } from "@/stores/rag-store";

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
}

interface NavigationGroup {
  name: string;
  items: NavigationItem[];
}

const navigationGroups: (NavigationItem | NavigationGroup)[] = [
  { name: "仪表板", href: "/dashboard", icon: LayoutDashboard },
  { name: "项目管理", href: "/projects", icon: FolderOpen },
  { name: "代理配置", href: "/proxy-config", icon: Settings },
  { name: "记忆管理", href: "/memory", icon: Brain },
  {
    name: "知识图谱",
    items: [
      { name: "图谱总览", href: "/knowledge-graph", icon: Network },
      { name: "时序实体", href: "/temporal-entities", icon: Clock },
      { name: "关系推理", href: "/relation-inference", icon: GitBranch },
      { name: "记忆合成", href: "/memory-synthesis", icon: Merge },
    ]
  },
  {
    name: "RAG功能",
    items: [
      { name: "知识源管理", href: "/rag-knowledge-sources", icon: BookOpen },
      { name: "融合搜索", href: "/fusion-search-config", icon: Search },
    ]
  },
  { name: "分段配置", href: "/segmentation-config", icon: Scissors },
  { name: "Token管理", href: "/token-management", icon: Key },
  { name: "数据分析", href: "/analytics", icon: BarChart3 },
  { name: "API文档", href: "/api-docs", icon: FileText },
  { name: "系统设置", href: "/settings", icon: Database },
];

export default function Sidebar() {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(["知识图谱", "RAG功能"]));
  const { knowledgeSources, searchResults } = useRAGStore();

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupName)) {
        newSet.delete(groupName);
      } else {
        newSet.add(groupName);
      }
      return newSet;
    });
  };

  const isGroup = (item: NavigationItem | NavigationGroup): item is NavigationGroup => {
    return 'items' in item;
  };

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-grow pt-5 bg-white dark:bg-gray-800 overflow-y-auto border-r border-gray-200 dark:border-gray-700">
        <div className="flex items-center flex-shrink-0 px-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <h1 className="ml-3 text-xl font-bold text-gray-900 dark:text-white">
              Onememory
            </h1>
          </div>
        </div>
        <div className="mt-8 flex-grow flex flex-col">
          <nav className="flex-1 px-2 pb-4 space-y-1">
            {navigationGroups.map((item) => {
              if (isGroup(item)) {
                const isExpanded = expandedGroups.has(item.name);
                return (
                  <div key={item.name}>
                    <button
                      onClick={() => toggleGroup(item.name)}
                      className="group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md transition-colors duration-150 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                    >
                      {isExpanded ? (
                        <ChevronDown className="mr-3 flex-shrink-0 h-4 w-4" />
                      ) : (
                        <ChevronRight className="mr-3 flex-shrink-0 h-4 w-4" />
                      )}
                      {item.name === "知识图谱" ? (
                        <Network className="mr-2 flex-shrink-0 h-5 w-5" />
                      ) : item.name === "RAG功能" ? (
                        <Search className="mr-2 flex-shrink-0 h-5 w-5" />
                      ) : (
                        <Network className="mr-2 flex-shrink-0 h-5 w-5" />
                      )}
                      <span className="flex-1 text-left">{item.name}</span>
                      {/* RAG功能组显示统计信息 */}
                      {item.name === "RAG功能" && (
                        <div className="flex space-x-1">
                          <span className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded-full">
                            {knowledgeSources.length}
                          </span>
                          {searchResults.length > 0 && (
                            <span className="bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded-full">
                              {searchResults.length}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                    {isExpanded && (
                      <div className="ml-6 mt-1 space-y-1">
                        {item.items.map((subItem) => (
                          <NavLink
                            key={subItem.name}
                            to={subItem.href}
                            className={({ isActive }) =>
                              `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                                isActive
                                  ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100"
                                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                              }`
                            }
                          >
                            <subItem.icon
                              className="mr-3 flex-shrink-0 h-4 w-4"
                              aria-hidden="true"
                            />
                            {subItem.name}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                );
              } else {
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                        isActive
                          ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100"
                          : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                      }`
                    }
                  >
                    <item.icon
                      className="mr-3 flex-shrink-0 h-5 w-5"
                      aria-hidden="true"
                    />
                    {item.name}
                  </NavLink>
                );
              }
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}