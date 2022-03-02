<template>
  <div class="quickly-install">
    <n-button :disabled="config.lockFunc" @click="startInstall">
      <n-space>
        <carbon:data-share style="font-size: 24px;" /> {{ t('button.quickly-install') }}
      </n-space>
    </n-button>
    <n-drawer :show="inProgress" width="100%" placement="left">
      <n-drawer-content>
        <n-result
          :status="[Status.Success, Status.Fail].includes(status) ? status : ''"
          style="margin: 10vh;"
          :title="{ success: t('install.success'), error: t('install.fail'), info: t('install.pending') }[status]"
          :description="progressText"
        >
          <template v-if="status === Status.Pending" #icon>
            <n-spin stroke="#2080f0" :show="true" :size="66" />
          </template>
          <template #footer>
            <n-progress v-if="percentage != -1" class="progress" type="line" :status="status" :percentage="percentage" :show-indicator="false" />
          </template>
        </n-result>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<script lang="ts" setup>
import { useConfigStore } from '../../store/config'
import { sshOperate } from '../../utils/ssh-operate'

const { t } = useI18n()

enum Status{
  Pending = 'info',
  Success = 'success',
  Fail = 'error',
}

const config = useConfigStore()
const percentage = ref<number>(-1)
const status = ref<Status>(Status.Pending)
const inProgress = ref<boolean>(false)
const progressText = ref<string>('')

const installProgress = (progress: number) => {
  percentage.value = progress
}

const startInstall = async() => {
  config.lockFunc = true
  inProgress.value = true
  status.value = Status.Pending
  percentage.value = 1
  try {
    progressText.value = t('install.update-system-origin')
    await sshOperate.updateSystemOrigin()
    installProgress(10)
    progressText.value = t('install.install-depend')
    await sshOperate.installDepend()
    installProgress(20)
    progressText.value = t('install.download-steam-cmd')
    await sshOperate.downloadSteamCMD()
    installProgress(30)
    progressText.value = t('install.install-steam-cmd')
    await sshOperate.installSteamCMD()
    installProgress(40)
    progressText.value = t('install.download-server-client')
    const res = await sshOperate.installServerClient()
    installProgress(80)
    if (res)
      status.value = Status.Success
    else
      status.value = Status.Fail
  }
  catch {
    status.value = Status.Fail
  }
  config.lockFunc = false
}
</script>

<style scoped>

.n-button {
  width: 100%;
  height: 100%;
  font-size: 24px;
}
</style>
