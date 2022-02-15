<template>
  <n-breadcrumb>
    <n-breadcrumb-item href="/">
      {{ t("breadcrumb.home") }}
    </n-breadcrumb-item>
    <n-breadcrumb-item>{{ t("breadcrumb.func") }}</n-breadcrumb-item>
    <n-breadcrumb-item>{{ t("breadcrumb.list") }}</n-breadcrumb-item>
  </n-breadcrumb>
  <n-h1>{{ t("title.mod-list") }}</n-h1>
  <n-list bordered>
    <n-list-item v-for="mod in mods" :key="mod">
      <n-thing :title="mod" description="description">
        <template #header-extra>
          <n-button quaternary type="info" @click="openSteamModDetail(mod)">
            {{ t('button.to-steam') }}
          </n-button>
        </template>
      </n-thing>
    </n-list-item>
  </n-list>
</template>

<script lang="ts" setup>
import { store } from '../../utils/electron-store'
import { localCache } from '../../utils/local-cache'

const { t } = useI18n()

const mods = ref<string[]>([])

const openSteamModDetail = (modSteamId: string) => {
  window.open(`https://steamcommunity.com/sharedfiles/filedetails?id=${modSteamId}`)
}

(async() => {
  // await store.set('connect-data', {
  //   host: '',
  //   port: '',
  //   username: '',
  //   password: '',
  // })
  await window.ssh.connect(await store.get('connect-data'))
  mods.value = await window.ssh.getServerSetupMods()
  console.log(await localCache.getModInfoBySteamModId(mods.value[0]))
})()
</script>
