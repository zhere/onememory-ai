<template>
  <div
    v-if="isActive"
    :class="contentClasses"
  >
    <slot />
  </div>
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

const { activeTab } = useTabsContext()
const isActive = computed(() => activeTab.value === props.value)

const contentClasses = computed(() => 
  cn(
    'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    props.class
  )
)
</script>