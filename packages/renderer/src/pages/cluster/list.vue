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
                      <n-button type="default" size="small" round @click="backupCluster(item.id)">
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
                      <n-button type="default" size="small" round @click="deleteCluster(item.id)">
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
      <n-button class="create-cluster" :loading="createLoading" @click="createCluster">
        添加一个新的默认存档
      </n-button>
      <n-empty v-if="clusterStore.list.length === 0" size="huge" :description="t('result.empty-cluster')" />
    </LockFunc>
  </div>
  <n-modal
    v-model:show="deleteConfirmShow"
    preset="dialog"
    :loading="deleteLoading"
    :title="t('dialog.confirm-delete')"
    :content="t('dialog.confirm-delete-text')"
    :positive-text="t('button.cancel')"
    :negative-text="t('button.confirm')"
    @positive-click="deleteCluster"
  />
</template>

<script lang="ts" setup>
import { useDialog, useMessage } from 'naive-ui'
import { useClusterStore } from '../../store/cluster'
import { dialog } from '../../utils/dialog'

const { t } = useI18n()
const message = useMessage()
const nDialog = useDialog()
const router = useRouter()
const clusterStore = useClusterStore()

const toClusterModManage = (cluster: string) => router.push({ path: `/mod/list/${cluster}` })

if (clusterStore.list.length === 0)
  clusterStore.getClusterList()

const backupCluster = async(cluster: string) => {
  const res = await dialog.showOpenDialog({
    title: `${t('dialog.backup-cluster')}[${cluster}]`,
    properties: ['openDirectory', 'createDirectory'],
  })
  if (!res.canceled) {
    if (await clusterStore.backupCluster(cluster, res.filePaths[0]))
      message.success(t('result.backup-cluster-success'))

    else
      message.error(t('result.backup-cluster-fail'))
  }
}

const createLoading = ref(false)
const createCluster = async() => {
  createLoading.value = true
  const res = await clusterStore.createCluster()
  if (res)
    message.success(t('result.create-cluster-success'))
  else
    message.error(t('result.create-cluster-fail'))
  createLoading.value = false
}

const deleteLoading = ref(false)
const deleteConfirmShow = ref(false)
const deleteCluster = async(cluster: string) => {
  const d = nDialog.success({
    title: t('dialog.confirm-delete'),
    content: t('dialog.confirm-delete-text'),
    positiveText: t('button.confirm'),
    negativeText: t('button.cancel'),
    onPositiveClick: async() => {
      d.loading = true
      const res = await clusterStore.deleteCluster(cluster)
      if (res)
        message.success(t('result.delete-cluster'))
      else
        message.error(t('result.delete-cluster-fail'))
    },
  })
}

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
.create-cluster {
  width: 100%;
}
</style>
