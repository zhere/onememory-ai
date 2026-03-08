<template>
  <div :class="progressClasses">
    <div
      :class="fillClasses"
      :style="{ width: `${percentage}%` }"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
  value: number
  max?: number
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  max: 100
})

const percentage = computed(() => Math.min(Math.max((props.value / props.max) * 100, 0), 100))

const progressClasses = computed(() => 
  cn('relative h-4 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800', props.class)
)

const fillClasses = 'h-full bg-blue-600 transition-all duration-300 ease-in-out'
</script>