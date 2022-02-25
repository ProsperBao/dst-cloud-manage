<template>
  <n-message-provider>
    <router-view />
  </n-message-provider>
</template>

<script setup lang="ts">
import { useConfigStore } from './store/config'
import { sshOperate } from './utils/ssh-operate'

const config = useConfigStore()

;(async() => {
  await config.initState()
  await sshOperate.connect({ ...config.server })
})()
</script>
