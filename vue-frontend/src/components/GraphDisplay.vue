<template>
  <div class="w-full h-full relative">
    <svg 
      :width="width" 
      :height="height" 
      class="w-full h-full"
    >
      <!-- 绘制边 -->
      <g class="edges">
        <line
          v-for="edge in edges"
          :key="`${edge.source}-${edge.target}`"
          :x1="getNodePosition(edge.source).x"
          :y1="getNodePosition(edge.source).y"
          :x2="getNodePosition(edge.target).x"
          :y2="getNodePosition(edge.target).y"
          :stroke="edgeColor"
          :stroke-width="edgeWidth"
          opacity="0.5"
        />
      </g>

      <!-- 绘制节点 -->
      <g class="nodes">
        <g
          v-for="node in graphData.nodes"
          :key="node.id"
          @click.stop="handleNodeClick(node)"
        >
          <circle
            :cx="getNodePosition(node.id).x"
            :cy="getNodePosition(node.id).y"
            :r="nodeRadius"
            :fill="getNodeColor(node)"
            :class="['cursor-pointer', highlightedNodeIds.includes(node.id) ? 'highlighted' : '']"
          />
          <text
            :x="getNodePosition(node.id).x"
            :y="getNodePosition(node.id).y"
            text-anchor="middle"
            dominant-baseline="middle"
            :fill="nodeTextColor"
            :font-size="nodeFontSize"
            class="select-none pointer-events-none"
          >
            {{ node.label }}
          </text>
        </g>
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
interface Node {
  id: string
  label: string
  type: 'concept' | 'entity' | 'insight' | 'memory_concept' | 'memory_tag' | 'technology' | 'person' | 'project' | 'location' | 'event'
  memoryIds?: string[]
  confidence?: number
}

interface Edge {
  source: string
  target: string
  type: string
  confidence?: number
}

interface GraphData {
  nodes: Node[]
  edges?: Edge[]
  links?: Edge[]
}

interface GraphDisplayProps {
  graphData: GraphData
  width?: number
  height?: number
  selectedMemoryIds?: string[]
  highlightedNodeIds?: string[]
}

const props = withDefaults(defineProps<GraphDisplayProps>(), {
  width: 800,
  height: 400,
  graphData: () => ({ nodes: [], edges: [] }),
  selectedMemoryIds: () => [],
  highlightedNodeIds: () => []
})

// 定义事件
const emit = defineEmits<{
  (e: 'onNodeClick', nodeId: string, memoryIds: string[]): void
}>()

// 计算属性：处理edges和links两种数据格式
const edges = computed(() => {
  return props.graphData.links || props.graphData.edges || []
})

// 图谱样式配置
const nodeRadius = 25
const nodeFontSize = 10
const edgeWidth = 1.5
const edgeColor = '#6B7280'
const nodeTextColor = '#FFFFFF'

// 节点颜色映射，与知识图谱页面保持一致
const nodeTypeColors: Record<string, string> = {
  concept: '#3B82F6',
  entity: '#10B981',
  insight: '#F59E42',
  memory_concept: '#8B5CF6',
  memory_tag: '#06B6D4',
  technology: '#F59E0B',
  person: '#3B82F6',
  project: '#10B981',
  location: '#EF4444',
  event: '#8B5CF6'
}

// 计算节点位置，实现简单的圆形布局
const getNodePosition = (nodeId: string) => {
  // 为每个节点生成唯一的位置，基于节点索引
  const nodeIndex = props.graphData.nodes.findIndex(node => node.id === nodeId)
  const totalNodes = props.graphData.nodes.length
  
  if (totalNodes === 0) {
    return { x: props.width / 2, y: props.height / 2 }
  }
  
  // 实现圆形布局
  const centerX = props.width / 2
  const centerY = props.height / 2
  const radius = Math.min(centerX, centerY) - 50 // 50 是边距
  const angle = (nodeIndex / totalNodes) * 2 * Math.PI
  
  return {
    x: centerX + radius * Math.cos(angle),
    y: centerY + radius * Math.sin(angle)
  }
}

// 获取节点颜色，考虑高亮状态
const getNodeColor = (node: Node) => {
  // 如果是高亮节点，使用高亮颜色
  if (props.highlightedNodeIds.includes(node.id)) {
    return '#F59E42' // 高亮颜色：橙色
  }
  
  // 如果节点与选中记忆相关，使用更强的颜色
  if (props.selectedMemoryIds.length > 0 && node.memoryIds) {
    const hasSelectedMemory = props.selectedMemoryIds.some(memoryId => 
      node.memoryIds?.includes(memoryId)
    )
    if (hasSelectedMemory) {
      return nodeTypeColors[node.type] || '#6B7280'
    }
    // 非相关节点使用灰度
    return '#9CA3AF'
  }
  
  // 默认颜色
  return nodeTypeColors[node.type] || '#6B7280'
}

// 处理节点点击
const handleNodeClick = (node: Node) => {
  emit('onNodeClick', node.id, node.memoryIds || [])
}
</script>

<style scoped>
.edges line {
  transition: all 0.3s ease;
}

.nodes circle {
  transition: all 0.3s ease;
}

.nodes circle:hover {
  stroke: #3B82F6;
  stroke-width: 3;
  opacity: 1;
}

.nodes circle.highlighted {
  stroke: #F59E42;
  stroke-width: 4;
  opacity: 1;
}

.nodes text {
  user-select: none;
  pointer-events: none;
}
</style>