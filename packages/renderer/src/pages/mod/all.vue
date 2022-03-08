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
      <n-list v-if="modStore.list.length > 0" bordered>
        <n-list-item v-for="item in modStore.list" :key="item.id">
          <n-spin :show="modStore.loading.includes(item.id)">
            <ModItem :mod="item" :readonly="true" />
          </n-spin>
        </n-list-item>
      </n-list>
      <n-empty v-if="modStore.list.length === 0" size="huge" :description="t('result.empty-mod')" />
    </LockFunc>
  </div>
</template>

<script lang="ts" setup>
import { useModStore } from '../../store/mod'
import { sshOperate } from '../../utils/ssh-operate'
import ModItem from './components/ModItem.vue'

const { t } = useI18n()
const modStore = useModStore()

const forceRefresh = () => modStore.forceUpdate()

// ;(async() => {
//   try {
//     modStore.initState(await sshOperate.getServerSetupMods('steamcmd/~/myDSTserver'))
//     modStore.setLockModFunc(false)
//   }
//   catch {
//     modStore.setLockModFunc(true)
//   }
//   modStore.patchApplyConfig()
// })()
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
.mod-list-container .n-empty {
  margin-top: 20vh;
}
.n-back-top {
  z-index: 100;
}
</style>
