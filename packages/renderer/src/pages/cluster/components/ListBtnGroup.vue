<template>
  <n-button-group>
    <n-tooltip placement="bottom" trigger="hover">
      <template #trigger>
        <n-button :cluster="cluster">
          <carbon:license-draft />
        </n-button>
      </template>
      {{ t('button.cluster-edit') }}
    </n-tooltip>
    <n-tooltip placement="bottom" trigger="hover">
      <template #trigger>
        <n-button type="default" size="small" round @click="backupCluster(cluster)">
          <carbon:data-backup />
        </n-button>
      </template>
      {{ t('button.cluster-backup') }}
    </n-tooltip>
    <n-tooltip placement="bottom" trigger="hover">
      <template #trigger>
        <n-button type="default" size="small" round @click="toClusterModManage(cluster)">
          <carbon:license-maintenance />
        </n-button>
      </template>
      {{ t('button.manage-mod') }}
    </n-tooltip>
    <n-tooltip placement="bottom" trigger="hover">
      <template #trigger>
        <n-button type="default" size="small" round @click="deleteCluster(cluster)">
          <carbon:delete />
        </n-button>
      </template>
      {{ t('button.cluster-delete') }}
    </n-tooltip>
  </n-button-group>
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
import { useClusterStore } from '../../../store/cluster'
import { dialog } from '../../../utils/dialog'
import CustomCluster from './CustomCluster.vue'

defineProps<{ cluster: string }>()

const { t } = useI18n()

const router = useRouter()
const message = useMessage()
const nDialog = useDialog()

const clusterStore = useClusterStore()
// 模组管理
const toClusterModManage = (cluster: string) => router.push({ path: `/mod/list/${cluster}` })
// 删除存档
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
// 备份存档
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
</script>
