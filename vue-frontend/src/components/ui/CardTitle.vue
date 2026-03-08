<template>
  <h3 :class="titleClasses">
    <slot />
  </h3>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
  class?: string
}

const props = defineProps<Props>()

const titleClasses = computed(() => 
  cn('text-lg font-semibold text-gray-900 dark:text-white', props.class)
)
</script>