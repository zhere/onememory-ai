<template>
  <button
    :class="triggerClasses"
    @click="handleClick"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'
import { useTabsContext } from './Tabs.vue'

interface Props {
  value: string
  class?: string
}

const props = defineProps<Props>()

const { activeTab, setActiveTab } = useTabsContext()
const isActive = computed(() => activeTab.value === props.value)

const triggerClasses = computed(() => 
  cn(
    'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    isActive.value 
      ? 'bg-white text-gray-950 shadow-sm dark:bg-gray-950 dark:text-gray-50' 
      : 'hover:bg-white/50 dark:hover:bg-gray-950/50',
    props.class
  )
)

function handleClick() {
  setActiveTab(props.value)
}
</script>