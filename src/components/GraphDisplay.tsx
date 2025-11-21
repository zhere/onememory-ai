import React from "react";

interface Node {
  id: string;
  label: string;
  type: string;
  memoryIds?: string[]; // 关联的记忆项目ID列表
}

interface Edge {
  source: string;
  target: string;
  type: string;
}

interface GraphData {
  nodes: Node[];
  edges: Edge[];
}

interface GraphDisplayProps {
  graphData: GraphData;
  selectedMemoryIds?: string[]; // 当前选中的记忆项目ID
  highlightedNodeIds?: string[]; // 需要高亮的节点ID
  onNodeClick?: (nodeId: string, memoryIds: string[]) => void; // 节点点击回调
}

const typeColors: Record<string, string> = {
  concept: "#3B82F6",
  entity: "#10B981",
  insight: "#F59E42",
  default: "#6B7280"
};

export default function GraphDisplay({ 
  graphData, 
  selectedMemoryIds = [], 
  highlightedNodeIds = [], 
  onNodeClick 
}: GraphDisplayProps) {
  // 简单布局算法：圆形分布节点
  const RADIUS = 120;
  const centerX = 200;
  const centerY = 160;
  const nodeCount = graphData.nodes.length;
  const nodePositions = graphData.nodes.map((node, i) => {
    const angle = (2 * Math.PI * i) / nodeCount;
    return {
      ...node,
      x: centerX + RADIUS * Math.cos(angle),
      y: centerY + RADIUS * Math.sin(angle)
    };
  });

  // 节点查找
  const getNodePos = (id: string) => nodePositions.find(n => n.id === id);

  // 判断节点是否应该高亮
  const isNodeHighlighted = (node: Node) => {
    return highlightedNodeIds.includes(node.id) || 
           (node.memoryIds && node.memoryIds.some(memId => selectedMemoryIds.includes(memId)));
  };

  // 处理节点点击
  const handleNodeClick = (node: Node) => {
    if (onNodeClick && node.memoryIds) {
      onNodeClick(node.id, node.memoryIds);
    }
  };

  return (
    <svg width={400} height={320} style={{ background: "#F3F4F6", borderRadius: 12 }}>
      {/* 绘制边 */}
      {graphData.edges.map((edge, idx) => {
        const source = getNodePos(edge.source);
        const target = getNodePos(edge.target);
        if (!source || !target) return null;
        return (
          <g key={idx}>
            <line
              x1={source.x}
              y1={source.y}
              x2={target.x}
              y2={target.y}
              stroke="#A3A3A3"
              strokeWidth={2}
              markerEnd="url(#arrowhead)"
            />
            {/* 关系类型标签 */}
            <text
              x={(source.x + target.x) / 2}
              y={(source.y + target.y) / 2 - 8}
              fontSize={12}
              fill="#6B7280"
              textAnchor="middle"
            >
              {edge.type}
            </text>
          </g>
        );
      })}
      {/* 绘制节点 */}
      {nodePositions.map((node, idx) => {
        const isHighlighted = isNodeHighlighted(node);
        return (
          <g key={node.id} style={{ cursor: onNodeClick ? 'pointer' : 'default' }}>
            <circle
              cx={node.x}
              cy={node.y}
              r={isHighlighted ? 28 : 24}
              fill={typeColors[node.type] || typeColors.default}
              stroke={isHighlighted ? "#F59E0B" : "#374151"}
              strokeWidth={isHighlighted ? 3 : 2}
              opacity={isHighlighted ? 1 : 0.8}
              onClick={() => handleNodeClick(node)}
            />
            {isHighlighted && (
              <circle
                cx={node.x}
                cy={node.y}
                r={32}
                fill="none"
                stroke="#F59E0B"
                strokeWidth={2}
                strokeDasharray="4,4"
                opacity={0.6}
              />
            )}
            <text
              x={node.x}
              y={node.y + 5}
              fontSize={isHighlighted ? 12 : 11}
              fill="#fff"
              textAnchor="middle"
              fontWeight="bold"
              onClick={() => handleNodeClick(node)}
            >
              {node.label}
            </text>
          </g>
        );
      })}
      {/* 箭头定义 */}
      <defs>
        <marker
          id="arrowhead"
          markerWidth="8"
          markerHeight="8"
          refX="8"
          refY="4"
          orient="auto"
        >
          <polygon points="0 0, 8 4, 0 8" fill="#A3A3A3" />
        </marker>
      </defs>
    </svg>
  );
}