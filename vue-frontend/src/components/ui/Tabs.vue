<template>
  <div :class="className">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { provide, ref, computed, inject, type InjectionKey, type Ref } from 'vue'

interface TabsContext {
  activeTab: Ref<string>
  setActiveTab: (value: string) => void
}

const TABS_CONTEXT_KEY: InjectionKey<TabsContext> = Symbol('tabs-context')

export function useTabsContext() {
  const context = inject(TABS_CONTEXT_KEY)
  if (!context) {
    throw new Error('Tabs components must be used within Tabs')
  }
  return context
}

interface Props {
  defaultValue: string
  class?: string
}

const props = defineProps<Props>()

const className = computed(() => props.class)

const activeTab = ref(props.defaultValue)

function setActiveTab(value: string) {
  activeTab.value = value
}

provide(TABS_CONTEXT_KEY, {
  activeTab: activeTab,
  setActiveTab
})
</script>