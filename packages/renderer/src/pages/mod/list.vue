<template>
  <div class="mod-list-container">
    <n-breadcrumb>
      <n-breadcrumb-item href="/">
        {{ t("breadcrumb.home") }}
      </n-breadcrumb-item>
      <n-breadcrumb-item>{{ t("breadcrumb.mod") }}</n-breadcrumb-item>
      <n-breadcrumb-item>{{ t("breadcrumb.list") }}</n-breadcrumb-item>
    </n-breadcrumb>
    <LockFunc>
      <n-h1>
        {{ t("title.mod-list") }}
        <n-button quaternary type="info" @click="forceRefresh">
          {{ t('button.force-refresh') }}
        </n-button>
      </n-h1>
      <n-back-top :right="40" />
      <n-list bordered>
        <n-list-item v-for="item in mod.list" :key="item.id">
          <n-spin :show="mod.loading.includes(item.id)">
            <ModItem :mod="item" />
          </n-spin>
        </n-list-item>
      </n-list>
    </LockFunc>
  </div>
</template>

<script lang="ts" setup>
import { useModStore } from '../../store/mod'
import { sshOperate } from '../../utils/ssh-operate'

const { t } = useI18n()
const mod = useModStore()

const forceRefresh = () => mod.forceUpdate()

;(async() => {
  mod.initState(await sshOperate.getServerSetupMods('steamcmd/~/myDSTserver'))
})()
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
