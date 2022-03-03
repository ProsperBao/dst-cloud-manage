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
            <n-progress v-if="percentage != -1" class="progress" type="line" :status="status" :percentage="percentage" :indicator-placement="'inside'" :processing="status === Status.Pending" />
            <n-collapse style="margin-top: 14px;">
              <n-collapse-item title="执行日志" name="1">
                <n-input
                  :value="progressLog.split('\n').reverse().join('\n')"
                  type="textarea"
                  :readonly="true"
                  placeholder="执行日志"
                />
              </n-collapse-item>
            </n-collapse>
          </template>
        </n-result>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<script lang="ts" setup>
import { useConfigStore } from '../../store/config'
import { sshOperate } from '../../utils/ssh-operate'
import { sleep } from '../../utils/time'

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
const progressLog = ref<string>('')

const installProgress = (progress: number) => {
  percentage.value = progress
}

const doProgress = async(desc: string, operate: () => Promise<any>, doneProgress?: number) => {
  progressText.value = desc
  await operate()
  progressLog.value = await sshOperate.currentServerInstallLog()
  doneProgress && installProgress(doneProgress)
}

const startInstall = async() => {
  // console.log(await sshOperate.initServerClient())
  const MAX_RETRY = 60 * 60 * 2
  config.lockFunc = true
  inProgress.value = true
  status.value = Status.Pending
  percentage.value = 1
  try {
    // await doProgress(t('install.update-system-origin'), sshOperate.updateSystemOrigin, 10)
    // await sleep(1000)
    // await doProgress(t('install.install-depend'), sshOperate.installDepend, 20)
    // await sleep(1000)
    // await doProgress(t('install.download-steam-cmd'), sshOperate.downloadSteamCMD, 30)
    // await sleep(1000)
    await doProgress(t('install.install-steam-cmd'), sshOperate.installSteamCMD, 40)
    await sleep(1000)
    progressText.value = t('install.download-server-client')
    sshOperate.installServerClient()

    let count = 0
    let progress = 0
    do {
      if (count > MAX_RETRY) {
        status.value = Status.Fail
        break
      }
      count += 1
      progress = await sshOperate.currentServerInstallProgress()
      if (progress === 100) {
        break
      }
      else if (progress === -1) {
        status.value = Status.Fail
        break
      }
      installProgress(40 + progress * 0.4)
      progressLog.value = await sshOperate.currentServerInstallLog()
      await sleep(1000)
    } while (progress !== -1)
    if (status.value === Status.Pending) {
      installProgress(80)
      status.value = Status.Success
      progressLog.value = await sshOperate.currentServerInstallLog()
    }
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
