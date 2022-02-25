<template>
  <div class="server-config-container">
    <n-space vertical :size="24">
      <n-breadcrumb>
        <n-breadcrumb-item href="/">
          {{ t("breadcrumb.home") }}
        </n-breadcrumb-item>
        <n-breadcrumb-item>{{ t("breadcrumb.config") }}</n-breadcrumb-item>
        <n-breadcrumb-item>{{ t("breadcrumb.server-extra") }}</n-breadcrumb-item>
      </n-breadcrumb>
      <LockFunc>
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
            <n-form-item :label="t('server.setup')" path="setup">
              <n-input v-model:value="model.setup" :placeholder="t('server.setup-required')" />
            </n-form-item>
            <div style="display: flex; justify-content: flex-end;">
              <n-button round type="primary" @click="validateDataSave">
                保存
              </n-button>
            </div>
          </n-form>
        </n-card>
      </LockFunc>
    </n-space>
  </div>
</template>

<script lang="ts" setup>
import { useMessage } from 'naive-ui'
import type { ServerExtra } from '../../store/config'
import { useConfigStore } from '../../store/config'

const { t } = useI18n()
const config = useConfigStore()
const message = useMessage()

const formRef = ref<any>(null)

const model = ref<ServerExtra>({ setup: '' })
if (config.serverExtra)
  model.value = { ...model.value, ...config.serverExtra }

const rules = ref({
  setup: [{ required: true, message: t('server.setup-required') }],
})

const validateDataSave = (e: Event) => {
  e.preventDefault()
  formRef.value.validate((errors: any) => {
    if (!errors) {
      const val = toRaw(model.value)
      config.updateServerExtra(val)
      message.success(t('save.success'))
    }
  })
}

</script>

<style>
.server-config-container {
  min-width: 500px;
}
</style>
