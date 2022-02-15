<template>
  <div>
    <n-button @click="connect">
      {{ t('button.save') }}
    </n-button>
    <n-button @click="$router.push({path:'/mod/list'})">
      to
    </n-button>
  </div>
</template>

<script lang="ts" setup>
import { store } from '../utils/electron-store'
const { t } = useI18n()

const connect = async() => {
  await window.ssh.connect(await store.get('connect-data'))
  const mods = await window.ssh.getServerSetupMods()
  console.log(mods)
}

</script>
