<template>
  <n-thing>
    <template #avatar>
      <n-avatar
        :size="100"
        :src="mod.icon"
      />
    </template>
    <template #header>
      {{ mod.title }}
    </template>
    <template #header-extra>
      <n-button-group>
        <n-tooltip placement="bottom" trigger="hover">
          <template #trigger>
            <n-button type="default" size="small" round @click="openSteamModDetail(mod.id)">
              <carbon:send-alt />
            </n-button>
          </template>
          {{ t('button.to-steam') }}
        </n-tooltip>
        <n-tooltip placement="bottom" trigger="hover">
          <template #trigger>
            <n-button type="default" size="small" round @click="translate(mod.id)">
              <carbon:translate />
            </n-button>
          </template>
          {{ t('button.translate-mod') }}
        </n-tooltip>
      </n-button-group>
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
</template>

<script lang="ts" setup>
import type { Mod } from '../store/mod'
import { useModStore } from '../store/mod'

defineProps<{ mod: Mod }>()

const { t } = useI18n()
const modStore = useModStore()

const translate = (id: string) => modStore.translate(id)
const openSteamModDetail = (modSteamId: string) => window.open(`https://steamcommunity.com/sharedfiles/filedetails?id=${modSteamId}`)
</script>
