<template>
  <div
    :class="itemClasses"
    @click="handleClick"
  >
    <slot />
    <span
      v-if="isSelected"
      class="absolute inset-y-0 right-0 flex items-center pr-4"
    >
      <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
      </svg>
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'
import { useSelectContext } from './Select.vue'

interface Props {
  value: string
  class?: string
}

const props = defineProps<Props>()

const { modelValue, handleValueChange } = useSelectContext()

const isSelected = computed(() => modelValue.value === props.value)

const itemClasses = computed(() => 
  cn(
    'relative cursor-pointer select-none py-2 pl-3 pr-9 hover:bg-gray-100 dark:hover:bg-gray-700',
    isSelected.value 
      ? 'bg-blue-50 text-blue-900 dark:bg-blue-900 dark:text-blue-100' 
      : 'text-gray-900 dark:text-gray-100',
    props.class
  )
)

function handleClick() {
  handleValueChange(props.value)
}
</script>