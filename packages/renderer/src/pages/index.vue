<template>
  <div>
    {{ t('button.hello') }}
    <n-button
      @click="router.push({
        path: '/111'
      })"
    >
      naive-ui
    </n-button>
  </div>
</template>

<script lang="ts" setup>
const router = useRouter()
const { t } = useI18n()
</script>
