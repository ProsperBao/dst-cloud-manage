<template>
  <div>
    <n-button @click="connect">
      {{ t('button.save') }}
    </n-button>
    <n-button @click="reload">
      刷新
    </n-button>
  </div>
</template>

<script lang="ts" setup>
import { useModStore } from '../store/mod'

const { t } = useI18n()

const mod = useModStore()

const connect = () => {
  mod.patchModConfig('362175979')
}

const reload = () => location.reload()

</script>
