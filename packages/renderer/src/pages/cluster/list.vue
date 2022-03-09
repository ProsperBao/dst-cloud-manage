<template>
  <div class="cluster-list-container">
    <n-breadcrumb>
      <n-breadcrumb-item href="/">
        {{ t("breadcrumb.home") }}
      </n-breadcrumb-item>
      <n-breadcrumb-item>{{ t("breadcrumb.cluster") }}</n-breadcrumb-item>
      <n-breadcrumb-item>{{ t("breadcrumb.list") }}</n-breadcrumb-item>
    </n-breadcrumb>
    <LockFunc>
      <n-list v-if="clusterStore.list.length > 0" bordered>
        <template v-for="item in clusterStore.list" :key="item.id">
          <n-list-item v-if="item.config">
            <n-thing>
              <template #avatar>
                <n-avatar :size="50">
                  <n-icon>
                    <carbon:task-tools />
                  </n-icon>
                </n-avatar>
              </template>
              <template #header>
                {{ item.config?.NETWORK?.cluster_name || t('result.empty-cluster-name') }}
              </template>
              <template #header-extra>
                <n-button-group>
                  <n-tooltip placement="bottom" trigger="hover">
                    <template #trigger>
                      <n-button type="default" size="small" round>
                        <carbon:data-backup />
                      </n-button>
                    </template>
                    {{ t('button.cluster-backup') }}
                  </n-tooltip>
                  <n-tooltip placement="bottom" trigger="hover">
                    <template #trigger>
                      <n-button type="default" size="small" round @click="toClusterModManage(item.id)">
                        <carbon:license-maintenance />
                      </n-button>
                    </template>
                    {{ t('button.manage-mod') }}
                  </n-tooltip>
                  <n-tooltip placement="bottom" trigger="hover">
                    <template #trigger>
                      <n-button type="default" size="small" round>
                        <carbon:delete />
                      </n-button>
                    </template>
                    {{ t('button.cluster-delete') }}
                  </n-tooltip>
                </n-button-group>
              </template>
              <template #description>
                {{ item.config?.NETWORK?.cluster_description || t('result.empty-cluster-description') }}
              </template>
              <n-space>
                <n-tag v-if="item.config?.GAMEPLAY?.game_mode" size="small" type="success">
                  {{ t("tag.game-mode") }}: {{ t(`tag.game-mode-${item.config?.GAMEPLAY?.game_mode}`) }}
                </n-tag>
                <n-tag v-if="item.config?.GAMEPLAY?.max_players" size="small" type="warning">
                  {{ t("tag.max-players") }}: {{ item.config?.GAMEPLAY?.max_players }}
                </n-tag>
                <n-tag v-if="item.config?.GAMEPLAY?.pvp === 'true'" size="small" type="error">
                  {{ t("tag.pvp") }}
                </n-tag>
              </n-space>
            </n-thing>
          </n-list-item>
        </template>
      </n-list>
      <n-empty v-if="clusterStore.list.length === 0" size="huge" :description="t('result.empty-cluster')" />
    </LockFunc>
  </div>
</template>

<script lang="ts" setup>
import { useClusterStore } from '../../store/cluster'

const { t } = useI18n()
const router = useRouter()
const clusterStore = useClusterStore()

const toClusterModManage = (cluster: string) => router.push({ path: `/mod/list/${cluster}` })

if (clusterStore.list.length === 0)
  clusterStore.getClusterList()
</script>

<style>
.steam-desc-container {
  width: 100%;

}
.cluster-list-container .n-empty {
  margin-top: 20vh;
}
.n-back-top {
  z-index: 100;
}
</style>
