<template>
  <template v-if="!config.lockFunc">
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
        <n-button @click="refreshMod">
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
import { sshOperate } from '../utils/ssh-operate'

const emits = defineEmits(['refreshMod'])

const { t } = useI18n()
const config = useConfigStore()
const message = useMessage()

const refreshMod = async() => {
  try {
    await sshOperate.connect({ ...config.server })
    emits('refreshMod')
  }
  catch {
    message.error('连接服务器失败')
  }
}
</script>
