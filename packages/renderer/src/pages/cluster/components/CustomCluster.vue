<template>
  <n-form
    ref="formRef"
    label-placement="top"
  >
    <n-grid :cols="24" :x-gap="24">
      <n-form-item-gi :span="12" label="Input" path="inputValue" />
    </n-grid>
  </n-form>
</template>

<script lang="ts" setup>
const { t } = useI18n()

defineProps<{ cluster?: string }>()

</script>
