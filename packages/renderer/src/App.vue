<template>
  <n-message-provider>
    <router-view />
  </n-message-provider>
</template>

<script setup lang="ts">
import { useConfigStore } from './store/config'
import useConfigFunc from './hooks/useConfigFunc'
import { useModStore } from './store/mod'

const configStore = useConfigStore()
const modStore = useModStore()
const { connectServer } = useConfigFunc()

;(async() => {
  await configStore.initState()
  await connectServer()
})()
</script>
