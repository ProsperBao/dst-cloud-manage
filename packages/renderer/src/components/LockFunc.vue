<template>
  <template v-if="!configStore.lockFunc && !modStore.lockModFunc">
    <slot />
  </template>
  <n-result
    v-else
    status="info"
    style="padding: 100px"
    :title="t('result.mod-list-locked')"
    :description="t('result.mod-list-locked-desc')"
  >
    <template #footer>
      <n-space justify="center">
        <n-button @click="refresh">
          {{ t('button.refresh') }}
        </n-button>
        <n-button @click="$router.push({ path: '/config/server' })">
          {{ t('button.to-config-server') }}
        </n-button>
      </n-space>
    </template>
  </n-result>
</template>

<script lang="ts" setup>
import { useMessage } from 'naive-ui'
import { useConfigStore } from '../store/config'
import useConfigFunc from '../hooks/useConfigFunc'
import { useModStore } from '../store/mod'

const { t } = useI18n()
const configStore = useConfigStore()
const modStore = useModStore()
const message = useMessage()
const { connectServer } = useConfigFunc()

const refresh = async() => !await connectServer() && message.error('连接服务器失败')

</script>
