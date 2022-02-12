<template>
  <div class="result-container">
    <n-result status="404" title="404 资源不存在" description="生活总归带点荒谬">
      <template #footer>
        <n-button @click="back">
          {{ t('button.back') }}
        </n-button>
      </template>
    </n-result>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const { t } = useI18n()

const back = () => {
  console.log(window.ssh)
  router.push('/')
}
</script>

<style>
.result-container{
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
