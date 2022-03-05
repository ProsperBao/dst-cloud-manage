<template>
  <div class="server-config-container">
    <n-space vertical :size="24">
      <n-breadcrumb>
        <n-breadcrumb-item href="/">
          {{ t("breadcrumb.home") }}
        </n-breadcrumb-item>
        <n-breadcrumb-item>{{ t("breadcrumb.config") }}</n-breadcrumb-item>
        <n-breadcrumb-item>{{ t("breadcrumb.translate") }}</n-breadcrumb-item>
      </n-breadcrumb>
      <n-alert :title="t('alert.info')" type="info">
        {{ t('alert.info-translate-content-part1') }}
        <n-text underline type="info" style="cursor: pointer;" @click="toBaiduApi">
          {{ t('alert.info-translate-content-part2') }}
        </n-text>
        {{ t('alert.info-translate-content-part3') }}
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
          <n-form-item :label="t('translate.bd-appid')" path="appid">
            <n-input v-model:value="model.appid" :placeholder="t('translate.bd-appid-required')" />
          </n-form-item>
          <n-form-item :label="t('translate.bd-key')" path="key">
            <n-input
              v-model:value="model.key" type="password"
              show-password-on="mousedown" :placeholder="t('translate.bd-key-required')"
            />
          </n-form-item>
          <n-form-item :label="t('translate.from')" path="from">
            <n-select
              v-model:value="model.from"
              :placeholder="t('translate.from-required')"
              :options="computedFrom"
            />
          </n-form-item>
          <n-form-item :label="t('translate.to')" path="to">
            <n-select
              v-model:value="model.to"
              :placeholder="t('translate.to-required')"
              :options="computedTo"
            />
          </n-form-item>
          <div style="display: flex; justify-content: flex-end;">
            <n-space :size="24">
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
import { useMessage } from 'naive-ui'
import { translateBaiduOptions } from '../../config/translate'
import type { Translate } from '../../store/config'
import { useConfigStore } from '../../store/config'

const { t } = useI18n()
const message = useMessage()
const configStore = useConfigStore()

const formRef = ref<any>(null)
const model = ref<Translate>({
  appid: '',
  key: '',
  from: 'en',
  to: 'zh',
  ...toRaw(configStore.translate),
})
const rules = ref({
  appid: [{ required: true, message: t('translate.bd-appid-required') }],
  key: [{ required: true, message: t('translate.bd-key-required') }],
  from: [{ required: true, message: t('translate.from-required') }],
  to: [{ required: true, message: t('translate.to-required') }],
})

const computedFrom = computed(() => translateBaiduOptions.filter(item => item.value !== model.value.to))
const computedTo = computed(() => translateBaiduOptions.filter(item => item.value !== model.value.from))

const toBaiduApi = () => window.open('https://fanyi-api.baidu.com/')

const validateDataSave = (e: Event) => {
  e.preventDefault()
  formRef.value.validate((errors: any) => {
    if (!errors) {
      configStore.updateTranslate(toRaw(model.value))
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
