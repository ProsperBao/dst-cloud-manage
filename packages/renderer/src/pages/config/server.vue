<template>
  <div class="server-config-container">
    <n-space vertical :size="24">
      <n-breadcrumb>
        <n-breadcrumb-item href="/">
          {{ t("breadcrumb.home") }}
        </n-breadcrumb-item>
        <n-breadcrumb-item>{{ t("breadcrumb.config") }}</n-breadcrumb-item>
        <n-breadcrumb-item>{{ t("breadcrumb.server") }}</n-breadcrumb-item>
      </n-breadcrumb>
      <n-alert :title="t('alert.warring')" type="warning">
        {{ t('alert.warring-server-content') }}
      </n-alert>
      <n-card>
        <n-form
          ref="formRef"
          :model="model"
          :rules="rules"
          label-placement="left"
          label-width="auto"
          label-align="left"
          require-mark-placement="right-hanging"
          :style="{
            maxWidth: '640px'
          }"
        >
          <n-form-item :label="t('server.host')" path="host">
            <n-input v-model:value="model.host" :placeholder="t('server.host-required')" />
          </n-form-item>
          <n-form-item :label="t('server.port')" path="port">
            <n-input-number v-model:value="model.port" :min="0" type="number" :placeholder="t('server.port-required')" />
          </n-form-item>
          <n-form-item :label="t('server.username')" path="username">
            <n-input v-model:value="model.username" :placeholder="t('server.username-required')" />
          </n-form-item>
          <n-form-item :label="t('server.password')" path="password">
            <n-input
              v-model:value="model.password" type="password"
              show-password-on="mousedown" :placeholder="t('server.password-required')"
            />
          </n-form-item>
          <div style="display: flex; justify-content: flex-end;">
            <n-space :size="24">
              <n-button round :type="connectMap[connectFlag]" @click="validateServerConnect">
                连接测试
              </n-button>
              <n-button round type="primary" @click="validateDataSave">
                保存
              </n-button>
            </n-space>
          </div>
        </n-form>
      </n-card>
    </n-space>
  </div>
</template>

<script lang="ts" setup>
import type { Config } from 'node-ssh'
import { useMessage } from 'naive-ui'
import { useConfigStore } from '../../store/config'
import { sshOperate } from '../../utils/ssh-operate'

const { t } = useI18n()
const config = useConfigStore()
const message = useMessage()

const formRef = ref<any>(null)
const model = ref<Config>({
  host: '',
  port: 22,
  username: '',
  password: '',
  ...toRaw(config.server),
})
const rules = ref({
  host: [{ required: true, message: t('server.host-required') }],
  port: [{ required: true, message: t('server.port-required') }],
  username: [{ required: true, message: t('server.username-required') }],
  password: [{ required: true, message: t('server.password-required') }],
})

enum ConnectFlag {
  Wait,
  Succeed,
  Fail,
}
const connectFlag = ref<ConnectFlag>(ConnectFlag.Wait)
const connectMap = ['', 'primary', 'error']
const validateDataSave = (e: Event) => {
  if (connectFlag.value !== ConnectFlag.Succeed) return message.error(t('save.connect-fail'))
  e.preventDefault()
  formRef.value.validate((errors: any) => {
    if (!errors) {
      const val = toRaw(model.value)
      config.updateServer(val)
      message.success(t('save.success'))
      sshOperate.connect(val)
    }
  })
}
const validateServerConnect = (e: Event) => {
  e.preventDefault()
  formRef.value.validate(async(errors: any) => {
    if (!errors) {
      try {
        const val = toRaw(model.value)
        await sshOperate.testConnect(toRaw({ ...val }))
        connectFlag.value = ConnectFlag.Succeed
        message.success(t('alert.connect-success'))
      }
      catch (error: any) {
        connectFlag.value = ConnectFlag.Fail
        message.error(error.message || t('alert.connect-error'), { closable: true })
      }
    }
  })
}

</script>

<style>
.server-config-container {
  min-width: 500px;
}
</style>
