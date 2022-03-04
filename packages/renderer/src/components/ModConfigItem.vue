<template>
  <n-h3 v-if="configItem.name==='Title' && configItem.label !== ''">
    {{ configItem.label }}
  </n-h3>
  <n-form-item v-if="configItem.name !== 'Title'" :path="configItem.name">
    <template #label>
      {{ configItem.label }}
      <template v-if="!!configItem.hover">
        ({{ configItem.hover }})
      </template>
    </template>
    <n-select
      :value="configItem.default"
      placeholder="Select"
      :options="configItem.options"
      :render-option="renderOption"
    />
  </n-form-item>
</template>

<script lang="ts" setup>
import { NTooltip } from 'naive-ui'
import type { VNode } from 'vue'
import type { ModConfig } from '../store/mod'
const { t } = useI18n()

const props = defineProps<{ configItem: ModConfig }>()

const value = ref<string | number | boolean>(props.configItem.default)

const renderOption = ({ node }: { node: VNode }) => {
  const hover = props.configItem.options.find(i => i.value === value.value)?.hover
  if (hover) {
    return h(NTooltip, null, {
      trigger: () => node,
      default: () => hover,
    })
  }
  else {
    return node
  }
}

</script>
