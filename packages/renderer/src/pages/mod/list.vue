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
    <n-list-item v-for="mod in modStore.modList" :key="mod">
      <n-spin :show="modStore.loading.includes(mod.id)">
        <n-thing>
          <template #avatar>
            <n-avatar
              :size="100"
              :src="mod.icon"
            />
          </template>
          <template #header>
            <n-popover trigger="hover">
              <template #trigger>
                <span @click="openSteamModDetail(mod.id)">
                  {{ mod.title }}
                </span>
              </template>
              <span>{{ t('button.to-steam') }}</span>
            </n-popover>
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
        </n-thing>
      </n-spin>
    </n-list-item>
  </n-list>
</template>

<script lang="ts" setup>
import { store } from '../../utils/electron-store'
import { useModStore } from '../../store/mod'

const { t } = useI18n()

const modStore = useModStore()

const forceRefresh = () => modStore.forceUpdateModInfo()

const openSteamModDetail = (modSteamId: string) => window.open(`https://steamcommunity.com/sharedfiles/filedetails?id=${modSteamId}`)

const loadModList = async() => {
  await window.ssh.connect(await store.get('connect-data'))
  const mods = await window.ssh.getServerSetupMods()
  modStore.setServerModList(mods)
}
loadModList()
</script>

<style>
.steam-desc-container {
  width: 100%;

}
.steam-desc-container img {
  max-width: 100%;
}
</style>
