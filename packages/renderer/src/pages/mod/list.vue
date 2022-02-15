<template>
  <n-breadcrumb>
    <n-breadcrumb-item href="/">
      {{ t("breadcrumb.home") }}
    </n-breadcrumb-item>
    <n-breadcrumb-item>{{ t("breadcrumb.func") }}</n-breadcrumb-item>
    <n-breadcrumb-item>{{ t("breadcrumb.list") }}</n-breadcrumb-item>
  </n-breadcrumb>
  <n-h1>{{ t("title.mod-list") }}</n-h1>
  <n-button quaternary type="info" @click="forceRefresh">
    {{ t('button.force-refresh') }}
  </n-button>
  <n-list bordered>
    <n-list-item v-for="mod in mods" :key="mod">
      <n-spin :show="loading.includes(mod.id)">
        <n-thing :title="mod.title">
          <template #avatar>
            <n-avatar
              :size="100"
              :src="mod.icon"
            />
          </template>
          <template #description>
            <n-text tag="div" depth="3">
              {{ t("describe.size") }}: {{ mod.size }}
            </n-text>
            <n-text v-if="!!mod.releaseDate" tag="div" depth="3">
              {{ t("describe.release-date") }}: {{ mod.releaseDate }}
            </n-text>
            <n-text v-if="!!mod.lastUpdateDate" tag="div" depth="3">
              {{ t("describe.last-update-date") }}: {{ mod.lastUpdateDate }}
            </n-text>
          </template>
          <n-collapse>
            <n-collapse-item title="查看Steam简介" name="1">
              <div class="steam-desc-container" v-html="mod.steamDescription" />
            </n-collapse-item>
          </n-collapse>
          <template #header-extra>
            <n-button quaternary type="info" @click="openSteamModDetail(mod.id)">
              {{ t('button.to-steam') }}
            </n-button>
          </template>
        </n-thing>
      </n-spin>
    </n-list-item>
  </n-list>
</template>

<script lang="ts" setup>
import { store } from '../../utils/electron-store'
import type { ModInfo } from '../../utils/local-cache'
import { localCache } from '../../utils/local-cache'
import { formatDateByLanguage } from '../../utils/date'

const { t } = useI18n()

const loading = ref<string[]>([])
const mods = ref<ModInfo[]>([])

const loadAllModInfo = () => {
  Promise.all(mods.value.map(async(modId, idx) => {
    loading.value.push(modId.id)
    localCache.getModInfoBySteamModId(modId.id, t('other.steamLanguage'))
      .then((res) => {
        try {
          const modInfo = JSON.parse(res)
          mods.value[idx] = { ...modId, ...modInfo }
          store.set('mod-list', mods.value)
          console.log('save cache', mods.value)
        }
        catch {
          console.log(mods.value[idx])
        }
      }).finally(() => {
        loading.value = loading.value.filter(id => id !== modId.id)
      })
  }))
    .finally(() => {
      store.set('mod-list', mods.value)
      console.log('save cache', mods.value)
    })
}

const loadModList = async() => {
  const modList = await store.get('mod-list')
  if (modList) {
    mods.value = modList
    console.log(mods.value)
  }
  else {
    await window.ssh.connect(await store.get('connect-data'))
    const modIds: string[] = await window.ssh.getServerSetupMods()
    mods.value = modIds.map(item => ({ id: item }))
    loadAllModInfo()
  }
}
loadModList()

const openSteamModDetail = (modSteamId: string) => {
  window.open(`https://steamcommunity.com/sharedfiles/filedetails?id=${modSteamId}`)
}

const forceRefresh = () => {
  store.delete('mod-list')
  loadModList()
}

const formatDate = (date: string) => formatDateByLanguage(date, t('other.dateFormat'))
console.log(formatDate('18 Sep, 2019 2:15pm'))
</script>

<style>
.steam-desc-container {
  width: 100%;

}
.steam-desc-container img {
  max-width: 100%;
}
</style>
