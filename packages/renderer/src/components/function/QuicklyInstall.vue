<template>
  <div class="quickly-install">
    <n-button class="start" :disabled="config.lockFunc" @click="startInstall">
      <n-space>
        <carbon:data-share style="font-size: 24px;" /> {{ t('button.quickly-install') }}
      </n-space>
    </n-button>
    <n-drawer :show="percentage > -1" width="100%" placement="left">
      <n-drawer-content>
        <n-result
          :status="[QuicklyInstallState.SUCCESS, QuicklyInstallState.FAIL].includes(status) ? status : ''"
          style="margin: 10vh;"
          :title="{ success: t('install.success'), error: t('install.fail'), info: t('install.pending') }[status]"
          :description="progressText"
        >
          <template v-if="status === QuicklyInstallState.PENDING" #icon>
            <n-spin stroke="#2080f0" :show="true" :size="66" />
          </template>
          <template #footer>
            <n-progress
              v-if="percentage != -1"
              class="progress"
              type="line"
              :status="status"
              :percentage="percentage"
              :indicator-placement="'inside'"
              :processing="status === QuicklyInstallState.PENDING"
            />
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
            <n-space v-if="[QuicklyInstallState.SUCCESS, QuicklyInstallState.FAIL].includes(status)">
              <n-button class="confirm1" @click="confirm">
                {{ t('button.confirm') }}
              </n-button>
            </n-space>
          </template>
        </n-result>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<script lang="ts" setup>
import { useMessage } from 'naive-ui'
import { QuicklyInstallState, QuicklyInstallStep } from '../../types/dst'
import { useConfigStore } from '../../store/config'
import { sshOperate } from '../../utils/ssh-operate'
import { sleep } from '../../utils/time'

const { t } = useI18n()
const message = useMessage()

const config = useConfigStore()
const percentage = ref<number>(-1)
const status = ref<QuicklyInstallState>(QuicklyInstallState.PENDING)

const progressText = ref<string>('')
const progressLog = ref<string>('')

const startInstall = async() => {
  config.lockFunc = true
  status.value = QuicklyInstallState.PENDING
  percentage.value = 1
  // 前置操作，不会耗时太久
  const stepList = [
    { step: QuicklyInstallStep.UPDATE_PACKAGE, progress: 10, text: t('install.update-package'), fail: t('result.update-package-fail') },
    { step: QuicklyInstallStep.INSTALL_DEPEND, progress: 20, text: t('install.install-depend'), fail: t('result.install-depend-fail') },
    { step: QuicklyInstallStep.DOWNLOAD_STEAM_CMD, progress: 30, text: t('install.download-steamcmd'), fail: t('result.download-steamcmd-fail') },
    { step: QuicklyInstallStep.INSTALL_STEAM_CMD, progress: 40, text: t('install.install-steamcmd'), fail: t('result.install-steamcmd-fail') },
  ]
  for (const step of stepList) {
    // 设置步骤描述
    progressText.value = step.text
    progressLog.value += `${step.text}\n`
    // 执行操作
    if (!await sshOperate.quicklyInstallStep(step.step)) {
      // 失败中断执行
      status.value = QuicklyInstallState.FAIL
      progressLog.value += `${step.fail}\n`
      return message.error(step.fail)
    }
    // 更新进度
    percentage.value = step.progress
  }
  // 安装服务器，时间可能会很长 1小时为限制，超过1小时直接失败
  sshOperate.quicklyInstallStep(QuicklyInstallStep.DOWNLOAD_DST_SERVER)
  progressText.value = t('install.download-server-client')
  for (let i = 0; i < 60 * 60; i++) {
    progressLog.value = await sshOperate.queryExecLog('download-dst-server')
    const current = await sshOperate.getDstInstallProgress()
    if (current === -1) {
      // 安装失败
      status.value = QuicklyInstallState.FAIL
      return message.error(t('result.install-server-fail'))
    }
    if (current === 100) break
    percentage.value = +(`${40 + current * 0.4}`.slice(0, 2))
    await sleep(1000)
  }
  percentage.value = 80
  progressText.value = t('install.init-cluster')
  if (!await sshOperate.execSpecialModConfigCluster()) {
    status.value = QuicklyInstallState.FAIL
    return message.error(t('result.init-cluster-fail'))
  }
  percentage.value = 100
  status.value = QuicklyInstallState.SUCCESS
  message.success(t('result.quickly-install-success'))
  config.lockFunc = false
}

const confirm = async() => {
  percentage.value = -1
  status.value = QuicklyInstallState.PENDING
  progressText.value = ''
  progressLog.value = ''
}
</script>

<style scoped>

.start {
  width: 100%;
  height: 100%;
  font-size: 24px;
}
.confirm {
  margin-top:24px
}
</style>
