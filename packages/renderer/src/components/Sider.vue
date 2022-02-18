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
import IconTranslate from '~icons/carbon/translate'
import IconHome from '~icons/carbon/home'
import IconModelAlt from '~icons/carbon/model-alt'
import IconBareMetalServer from '~icons/carbon/bare-metal-server'
import IconSettings from '~icons/carbon/settings'

defineProps<{ collapsed: Boolean }>()

const { t } = useI18n()

const activeKey = ref<string>('go-mod-home')
function renderIcon(icon: any) {
  return () => h(icon)
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
    icon: renderIcon(IconHome),
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
    icon: renderIcon(IconModelAlt),
  },
  {
    label: t('menu.config'),
    key: 'config',
    icon: renderIcon(IconSettings),
    children: [
      {
        label: () =>
          h(
            RouterLink,
            {
              to: {
                path: '/config/server',
              },
            },
            { default: () => t('menu.server') },
          ),
        key: 'go-config-server',
        icon: renderIcon(IconBareMetalServer),
      },
      {
        label: () =>
          h(
            RouterLink,
            {
              to: {
                path: '/config/translate',
              },
            },
            { default: () => t('menu.translate') },
          ),
        key: 'go-config-translate',
        icon: renderIcon(IconTranslate),
      },
    ],
  },
]
</script>
