import type { Config } from 'node-ssh'
import { defineStore } from 'pinia'
import { store } from '../utils/electron-store'

export interface Translate {
  appid?: string
  key?: string
  from?: string
  to?: string
}

export const useConfigStore = defineStore('config', {
  state: (): {
    server: Config
    translate: Translate
  } => ({
    server: {},
    translate: {},
  }),
  getters: {},
  actions: {
    async initState() {
      this.server = await store.get('config-server')
      this.translate = await store.get('config-translate')
    },
  },
})
