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
      v-if="['string','number'].includes(typeof configValue)"
      v-model:value="configValue"
      placeholder="Select"
      :options="configItem.options"
      :render-option="renderOption"
    />
    <n-switch v-else v-model:value="configValue">
      <template #checked>
        {{ t('switch.enabled') }}
      </template>
      <template #unchecked>
        {{ t('switch.disabled') }}
      </template>
    </n-switch>
  </n-form-item>
</template>

<script lang="ts" setup>
import { NTooltip } from 'naive-ui'
import type { VNode } from 'vue'
import type { ModConfig } from '../../../store/mod'

const { t } = useI18n()

const props = defineProps<{ configItem: ModConfig; value?: string | number | boolean }>()
const emits = defineEmits(['update:value'])

const configValue = computed({
  set: val => emits('update:value', val),
  get: () => {
    if (!props.value) {
      emits('update:value', props.configItem.default)
      return ''
    }
    return props.value
  },
})

const renderOption = ({ node }: { node: VNode }) => {
  const hover = props.configItem.options.find(i => i.value === configValue.value)?.hover
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
