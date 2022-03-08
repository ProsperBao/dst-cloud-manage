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
      <n-space align="center">
        <!-- <n-switch :value="active" size="large" @click.stop="modStore.setModEnabledStatus(props.mod.id, !active)"> -->
        <n-switch :value="active" size="large">
          <template #checked>
            {{ t('switch.enabled') }}
          </template>
          <template #unchecked>
            {{ t('switch.disabled') }}
          </template>
        </n-switch>
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
              <n-button type="default" size="small" round @click="forceRefresh(mod.id)">
                <carbon:rotate-360 />
              </n-button>
            </template>
            {{ t('button.reset-mod-info') }}
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
      </n-space>
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
      <n-collapse-item :title="t('button.view-steam')" name="1">
        <div class="steam-desc-container" v-html="mod.steamDescription" />
      </n-collapse-item>
      <n-collapse-item v-if="configList.length> 1" :title="t('button.mod-config')" name="2">
        <template #header-extra>
          <n-button-group>
            <n-tooltip placement="bottom" trigger="hover">
              <template #trigger>
                <n-button type="default" size="small" round @click.stop="resetConfig()">
                  <carbon:reset />
                </n-button>
              </template>
              {{ t('button.reset-mod-config') }}
            </n-tooltip>
            <n-tooltip placement="bottom" trigger="hover">
              <template #trigger>
                <n-button type="default" size="small" round @click.stop="translateConfig(mod.id)">
                  <carbon:translate />
                </n-button>
              </template>
              {{ t('button.translate-mod-config') }}
            </n-tooltip>
          </n-button-group>
        </template>
        <n-form>
          <template v-for="formItem in configList" :key="formItem.name">
            <ModConfigItem v-model:value="configState[formItem.name]" :config-item="formItem" />
          </template>
          <div style="display: flex; justify-content: flex-end">
            <n-button round type="primary" @click="applyModConfig">
              应用
            </n-button>
          </div>
        </n-form>
      </n-collapse-item>
    </n-collapse>
  </n-thing>
</template>

<script lang="ts" setup>
import type { Mod } from 'dst'
import { useModStore } from '../../../store/mod'
import ModConfigItem from './ModConfigItem.vue'

const props = defineProps<{ mod: Mod; readonly: boolean }>()

const { t } = useI18n()
const modStore = useModStore()
// config list
const configList = computed(() => (props.mod.originConfig || []).filter(i => i.options.length !== 1 && i.options[0].label !== ''))
// mod enabled state
const active = computed(() => false)
// mod config state
const configState = ref<any>({})
// translate mod info
const translate = (id: string) => modStore.translate(id)
const translateConfig = (id: string) => modStore.translateConfig(id)
// force refresh mod info
const forceRefresh = (id: string) => modStore.forceUpdate(id)
// open steam mod detail
const openSteamModDetail = (modSteamId: string) => window.open(`https://steamcommunity.com/sharedfiles/filedetails?id=${modSteamId}`)
// reset default mod config
const resetConfig = () => {
  // props.mod.originConfig?.forEach((i) => {
  //   configState.value[i.name] = i.default
  // })
}
// apply mod config
const applyModConfig = () => {
  // modStore.applyServerModConfig()
}
</script>
