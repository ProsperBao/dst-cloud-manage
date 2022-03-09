<template>
  <n-grid :x-gap="24" :y-gap="24" :cols="2">
    <n-grid-item>
      <QuicklyInstall class="index-btn-container" />
    </n-grid-item>
    <n-grid-item>
      <UpdateMod class="index-btn-container" />
    </n-grid-item>
  </n-grid>
</template>

<script lang="ts" setup>

</script>

<style scoped>
.index-btn-container {
  width: 100%;
  height: calc(50vh - 24px - 12px);
}
</style>
