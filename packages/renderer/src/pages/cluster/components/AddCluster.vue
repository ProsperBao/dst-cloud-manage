<template>
  <n-button-group class="create-cluster-group">
    <n-button class="create-cluster-btn" :loading="createLoading" @click="createCluster">
      添加空白存档
    </n-button>
    <n-button class="create-cluster-btn">
      添加配置存档
    </n-button>
  </n-button-group>
</template>

<script lang="ts" setup>
import { useMessage } from 'naive-ui'
import { useClusterStore } from '../../../store/cluster'
import CustomCluster from './CustomCluster.vue'

const { t } = useI18n()
const message = useMessage()
const clusterStore = useClusterStore()

const createLoading = ref(false)
const createCluster = async() => {
  createLoading.value = true
  const res = await clusterStore.createCluster()
  if (res)
    message.success(t('result.create-cluster-success'))
  else
    message.error(t('result.create-cluster-fail'))
  createLoading.value = false
}
</script>

<style scoped>
.create-cluster-group {
    width: 100%;
}
.create-cluster-group .create-cluster-btn {
    width: 50%;
}
</style>
