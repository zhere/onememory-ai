<template>
  <div class="relative">
    <button
      type="button"
      :class="triggerClasses"
      @click="toggle"
    >
      <span :class="valueClasses">
        {{ modelValue || placeholder }}
      </span>
      <svg
        :class="iconClasses"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    
    <div
      v-if="open"
      ref="contentRef"
      :class="contentClasses"
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
  modelValue?: string
  placeholder?: string
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Select an option'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const open = ref(false)
const contentRef = ref<HTMLElement>()

const triggerClasses = computed(() => 
  cn(
    'flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white',
    props.class
  )
)

const valueClasses = computed(() => 
  cn('block truncate', !props.modelValue && 'text-gray-500 dark:text-gray-400')
)

const iconClasses = computed(() => 
  cn('h-4 w-4 opacity-50 transition-transform', open.value && 'rotate-180')
)

const contentClasses = computed(() => 
  cn(
    'absolute top-full z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:border-gray-600 dark:bg-gray-800 sm:text-sm',
    props.class
  )
)

function toggle() {
  open.value = !open.value
}

function handleValueChange(value: string) {
  emit('update:modelValue', value)
  open.value = false
}

function handleClickOutside(event: MouseEvent) {
  if (contentRef.value && !contentRef.value.contains(event.target as Node)) {
    open.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})

// 提供选择器上下文
import { provide, inject, type InjectionKey, type ComputedRef } from 'vue'

interface SelectContext {
  modelValue: ComputedRef<string | undefined>;
  handleValueChange: (value: string) => void;
}

const SELECT_CONTEXT_KEY: InjectionKey<SelectContext> = Symbol('select-context')

provide(SELECT_CONTEXT_KEY, {
  modelValue: computed(() => props.modelValue),
  handleValueChange,
})

export function useSelectContext() {
  const context = inject(SELECT_CONTEXT_KEY)
  if (!context) {
    throw new Error('SelectItem must be used within Select')
  }
  return context
}
</script>