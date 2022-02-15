<template>
  <n-layout has-sider>
    <n-layout-sider
      collapse-mode="width"
      :collapsed-width="60"
      :width="120"
      show-trigger="arrow-circle"
      content-style="padding: 24px;"
      bordered
    >
      侧边栏
    </n-layout-sider>
    <n-layout-content content-style="padding: 24px;">
      <router-view />
    </n-layout-content>
  </n-layout>
</template>
