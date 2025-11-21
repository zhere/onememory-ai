import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home, Network, Activity, GitBranch, Merge } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
  isActive?: boolean;
}

interface KnowledgeGraphBreadcrumbProps {
  selectedProject?: string;
  className?: string;
}

export default function KnowledgeGraphBreadcrumb({ 
  selectedProject = "所有项目", 
  className 
}: KnowledgeGraphBreadcrumbProps) {
  const location = useLocation();
  
  // 知识图谱页面映射
  const pageMap: Record<string, { label: string; icon: React.ReactNode }> = {
    '/knowledge-graph': { 
      label: '图谱总览', 
      icon: <Network className="h-4 w-4" /> 
    },
    '/temporal-entities': { 
      label: '时序实体', 
      icon: <Activity className="h-4 w-4" /> 
    },
    '/relation-inference': { 
      label: '关系推理', 
      icon: <GitBranch className="h-4 w-4" /> 
    },
    '/memory-synthesis': { 
      label: '记忆合成', 
      icon: <Merge className="h-4 w-4" /> 
    }
  };

  // 构建面包屑路径
  const buildBreadcrumbs = (): BreadcrumbItem[] => {
    const breadcrumbs: BreadcrumbItem[] = [
      {
        label: '首页',
        path: '/',
        icon: <Home className="h-4 w-4" />
      },
      {
        label: '知识图谱',
        path: '/knowledge-graph',
        icon: <Network className="h-4 w-4" />
      }
    ];

    // 如果不在图谱总览页面，添加当前页面
    if (location.pathname !== '/knowledge-graph') {
      const currentPage = pageMap[location.pathname];
      if (currentPage) {
        breadcrumbs.push({
          label: currentPage.label,
          path: location.pathname,
          icon: currentPage.icon,
          isActive: true
        });
      }
    } else {
      // 在图谱总览页面，标记为活跃
      breadcrumbs[breadcrumbs.length - 1].isActive = true;
    }

    return breadcrumbs;
  };

  const breadcrumbs = buildBreadcrumbs();

  // 快速导航选项
  const quickNavItems = [
    { 
      label: '图谱总览', 
      path: '/knowledge-graph', 
      icon: <Network className="h-4 w-4" />,
      description: '整体视图和统计'
    },
    { 
      label: '时序实体', 
      path: '/temporal-entities', 
      icon: <Activity className="h-4 w-4" />,
      description: '实体生命周期'
    },
    { 
      label: '关系推理', 
      path: '/relation-inference', 
      icon: <GitBranch className="h-4 w-4" />,
      description: '智能关系发现'
    },
    { 
      label: '记忆合成', 
      path: '/memory-synthesis', 
      icon: <Merge className="h-4 w-4" />,
      description: '跨会话整合'
    }
  ];

  return (
    <div className={cn("space-y-4", className)}>
      {/* 面包屑导航 */}
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
        {breadcrumbs.map((item, index) => (
          <React.Fragment key={item.path}>
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
            )}
            <Link
              to={item.path}
              className={cn(
                "flex items-center space-x-1 hover:text-foreground transition-colors",
                item.isActive && "text-foreground font-medium"
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          </React.Fragment>
        ))}
      </nav>

      {/* 项目信息和快速导航 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">当前项目:</span>
          <span className="text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
            {selectedProject}
          </span>
        </div>

        {/* 快速导航下拉菜单 */}
        <div className="relative group">
          <button className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Network className="h-4 w-4" />
            <span>快速导航</span>
            <ChevronRight className="h-3 w-3 transform group-hover:rotate-90 transition-transform" />
          </button>
          
          {/* 下拉菜单 */}
          <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <div className="p-2">
              <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
                知识图谱功能
              </div>
              {quickNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-start space-x-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
                    location.pathname === item.path && "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                  )}
                >
                  <div className="mt-0.5">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">
                      {item.label}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.description}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}