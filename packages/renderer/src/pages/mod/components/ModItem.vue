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
      <n-space align="center" class="w-220">
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
import type { ClusterModConfigItem, ClusterModConfigOptions, Mod } from 'dst'
import { useMessage } from 'naive-ui'
import { useClusterStore } from '../../../store/cluster'
import { useModStore } from '../../../store/mod'
import ModConfigItem from './ModConfigItem.vue'

const props = defineProps<{ mod: Mod; readonly?: boolean; cluster?: string; config: ClusterModConfigItem }>()

const { t } = useI18n()
const message = useMessage()
const modStore = useModStore()
const clusterStore = useClusterStore()
// 模组配置选项
const configList = computed(() => (props.mod.originConfig || []).filter(i => i.options.length !== 1 && i.options[0].label !== ''))
// 模组启用状态
const active = computed(() => props.config.enabled || false)
// 模组配置数据
const configState = ref<ClusterModConfigOptions>({
  ...props.config.configuration_options,
})
// 翻译模组详情
const translate = (id: string) => modStore.translate(id)
// 翻译模组配置详情
const translateConfig = (id: string) => modStore.translateConfig(id)

// 强制刷新所有模组数据
const forceRefresh = (id: string) => modStore.forceUpdate(id)
// 打开模组 Steam 详情
const openSteamModDetail = (modSteamId: string) => window.open(`https://steamcommunity.com/sharedfiles/filedetails?id=${modSteamId}`)

// 重置默认配置
const resetConfig = () => {
  props.mod.originConfig?.forEach((i) => {
    configState.value[i.name] = i.default
  })
}
// 应用模组配置
const applyModConfig = async() => {
  if (props.cluster) {
    clusterStore.setClusterModConfig(props.cluster, props.mod.id, {
      enabled: props.config.enabled,
      configuration_options: configState.value,
    })
    if (await clusterStore.applyModConfig(props.cluster))
      message.success(t('message.apply-mod-config-success'))
    else
      message.error(t('message.apply-mod-config-fail'))
  }
  else { message.error(t('message.apply-mod-config-fail')) }
}
</script>

<style>
.w-220{
  width: 220px;
}
</style>
