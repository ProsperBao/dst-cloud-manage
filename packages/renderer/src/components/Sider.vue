<template>
  <n-menu
    v-model:value="activeKey"
    :collapsed="collapsed"
    :collapsed-width="60"
    :collapsed-icon-size="22"
    :options="menuOptions"
  />
</template>

<script lang="ts" setup>
import { RouterLink } from 'vue-router'
import { ExtensionPuzzleSharp, HomeSharp, ServerSharp } from '@vicons/ionicons5'
import { NIcon } from 'naive-ui'

defineProps<{ collapsed: Boolean }>()

const { t } = useI18n()

const activeKey = ref<string>('go-mod-home')

function renderIcon(icon) {
  return () => h(NIcon, null, { default: () => h(icon) })
}

const menuOptions = [
  {
    label: () =>
      h(
        RouterLink,
        {
          to: {
            path: '/',
          },
        },
        { default: () => t('menu.home') },
      ),
    key: 'go-mod-home',
    icon: renderIcon(HomeSharp),
  },
  {
    label: () =>
      h(
        RouterLink,
        {
          to: {
            path: '/mod/list',
          },
        },
        { default: () => t('menu.mod') },
      ),
    key: 'go-mod-list',
    icon: renderIcon(ExtensionPuzzleSharp),
  },
  {
    label: () =>
      h(
        RouterLink,
        {
          to: {
            path: '/server',
          },
        },
        { default: () => t('menu.server') },
      ),
    key: 'go-server-config',
    icon: renderIcon(ServerSharp),
  },
]
</script>
