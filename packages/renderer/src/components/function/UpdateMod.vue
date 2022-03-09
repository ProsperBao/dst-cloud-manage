<template>
  <div class="update-mod">
    <n-button :disabled="configStore.lockFunc" @click="startUpdate">
      <n-spin :show="loading">
        <n-space>
          <carbon:data-share style="font-size: 24px;" /> {{ t('button.update-mod') }}
        </n-space>
      </n-spin>
    </n-button>
  </div>
</template>

<script lang="ts" setup>
import { useMessage } from 'naive-ui'
import { useConfigStore } from '../../store/config'
import { useModStore } from '../../store/mod'

const { t } = useI18n()
const message = useMessage()
const configStore = useConfigStore()
const modStore = useModStore()
const loading = ref(false)

const startUpdate = async() => {
  loading.value = true
  try {
    await modStore.createSpecialModConfigCluster()
    message.success(t('result.update-mod-success'))
  }
  catch {
    message.error(t('result.update-mod-failed'))
  }
  finally {
    loading.value = false
  }
}
</script>

<style scoped>

.n-button {
  width: 100%;
  height: 100%;
  font-size: 24px;
}
</style>
