<template>
  <div class="mod-list-container">
    <n-breadcrumb>
      <n-breadcrumb-item href="/">
        {{ t("breadcrumb.home") }}
      </n-breadcrumb-item>
      <n-breadcrumb-item>{{ t("breadcrumb.mod") }}</n-breadcrumb-item>
      <n-breadcrumb-item>{{ t("breadcrumb.list") }}</n-breadcrumb-item>
    </n-breadcrumb>
    <n-h1>{{ t("title.mod-list") }}</n-h1>
    <n-button quaternary type="info" @click="forceRefresh">
      {{ t('button.force-refresh') }}
    </n-button>
    <n-back-top :right="40" />
    <n-list bordered>
      <n-list-item v-for="item in mod.list" :key="item.id">
        <n-spin :show="mod.loading.includes(item.id)">
          <n-thing>
            <template #avatar>
              <n-avatar
                :size="100"
                :src="item.icon"
              />
            </template>
            <template #header>
              {{ item.title }}
            </template>
            <template #header-extra>
              <n-button-group>
                <n-tooltip placement="bottom" trigger="hover">
                  <template #trigger>
                    <n-button type="default" size="small" round @click="openSteamModDetail(item.id)">
                      <carbon:send-alt />
                    </n-button>
                  </template>
                  {{ t('button.to-steam') }}
                </n-tooltip>
                <n-tooltip placement="bottom" trigger="hover">
                  <template #trigger>
                    <n-button type="default" size="small" round @click="translate(item.id)">
                      <carbon:translate />
                    </n-button>
                  </template>
                  {{ t('button.translate-mod') }}
                </n-tooltip>
              </n-button-group>
            </template>
            <template #description>
              <n-text tag="div" depth="3">
                {{ t("describe.size") }}: {{ item.size }}
              </n-text>
              <n-text v-if="!!item.releaseDate" tag="div" depth="3">
                {{ t("describe.release-date") }}: {{ item.releaseDate }}
              </n-text>
              <n-text v-if="!!item.lastUpdateDate" tag="div" depth="3">
                {{ t("describe.last-update-date") }}: {{ item.lastUpdateDate }}
              </n-text>
            </template>
            <n-collapse>
              <n-collapse-item title="查看Steam简介" name="1">
                <div class="steam-desc-container" v-html="item.steamDescription" />
              </n-collapse-item>
            </n-collapse>
          </n-thing>
        </n-spin>
      </n-list-item>
    </n-list>
  </div>
</template>

<script lang="ts" setup>
import { useModStore } from '../../store/mod'
// import { store } from '../../utils/electron-store'

const { t } = useI18n()
const mod = useModStore()

const forceRefresh = () => mod.forceUpdate()

const openSteamModDetail = (modSteamId: string) => window.open(`https://steamcommunity.com/sharedfiles/filedetails?id=${modSteamId}`)

const translate = (id: string) => mod.translate(id)

// const init = async() => {
//   await window.ssh.connect(await store.get('config-server'))
//   const serverList = await window.ssh.getServerSetupMods()
//   mod.initState(serverList)
// }
// init()
</script>

<style>
.steam-desc-container {
  width: 100%;

}
.steam-desc-container img {
  max-width: 100%;
}
.mod-list-container {
  min-width: 500px;
}
</style>
