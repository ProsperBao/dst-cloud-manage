<template>
  <div>
    <n-button @click="connect">
      {{ t('button.save') }}
    </n-button>
  </div>
</template>

<script lang="ts" setup>
const { t } = useI18n()

const connect = async() => {
  // await window.ssh.connect(await store.get('connect-data'))
  // const mods = await window.ssh.getServerSetupMods()
}

</script>
