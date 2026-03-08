<template>
  <div :class="headerClasses">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
  class?: string
}

const props = defineProps<Props>()

const headerClasses = computed(() => 
  cn('px-6 py-4 border-b border-gray-200 dark:border-gray-700', props.class)
)
</script>