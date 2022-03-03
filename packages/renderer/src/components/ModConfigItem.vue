<template>
  <n-h3 v-if="configItem.name==='Title' && configItem.label !== ''">
    {{ configItem.label }}
  </n-h3>
  <n-form-item v-if="configItem.name !== 'Title'" :path="configItem.name">
    <template #label>
      <n-space>
        <span>{{ configItem.label }}</span>
        <span><carbon:translate /></span>
      </n-space>
    </template>
    <n-select
      :value="configItem.default"
      placeholder="Select"
      :options="configItem.options"
    />
  </n-form-item>
</template>

<script lang="ts" setup>
import type { ModConfig } from '../store/mod'
const { t } = useI18n()

const props = defineProps<{ configItem: ModConfig }>()
</script>
