import { defineStore } from 'pinia'
import { i18n } from '../modules/i18n'
import { localCache } from '../utils/local-cache'
import { store } from '../utils/electron-store'

export interface ModInfo {
  title?: string
  description?: string
  steamDescription?: string
  id: string
  icon?: string
  size?: string
  lastUpdateDate?: string
  releaseDate?: string
  lastDetectionTime?: string
}
export const useModStore = defineStore('mod', {
  state: (): {
    cache: Record<string, ModInfo>
    loading: string[]
    serverModList: string[]
  } => ({
    cache: {},
    loading: [],
    serverModList: [],
  }),
  getters: {
    modList: (state): ModInfo[] => {
      return state.serverModList.map((id: string) => state.cache[id] || { id })
    },
  },
  actions: {
    async getModInfoByWorkshopId(id: string) {
      const steamLanguage = (i18n.global as any).t('other.steamLanguage')

      const mod = await localCache.getModInfoBySteamModId(id, steamLanguage)
      try {
        this.$patch({
          cache: {
            [id]: JSON.parse(mod),
          },
        })
        store.set(`mod-list-${id}`, this.cache[id])
      }
      catch {
        console.log(`Failed to parse mod info for ${id}`)
      }
    },
    async detectModInfoChange(id: string) {
      let mod = this.cache[id]
      this.loading.push(id)
      // read from cache
      if (!mod) {
        try {
          this.cache[id] = await store.get(`mod-list-${id}`)
          mod = this.cache[id]
        }
        catch {
          mod = { id }
        }
      }
      // whether it is within the cache validity period
      if (mod.lastDetectionTime) {
        const lastDetectionTime = Number(mod.lastDetectionTime)
        const now = new Date().getTime()
        if (now - lastDetectionTime < 1000 * 60 * 60 * 12) {
          this.loading = this.loading.filter(i => i !== id)
          return
        }
      }
      await this.getModInfoByWorkshopId(id)
      this.loading = this.loading.filter(i => i !== id)
    },
    async detectModListChange(mods: string[]) {
      const queue = []
      for (let i = 0; i < mods.length; i += 5)
        queue.push(mods.slice(i, i + 5))
      for (const queueItem of queue)
        await Promise.all(queueItem.map(id => (async() => await this.detectModInfoChange(id))()))
    },
    setServerModList(mods: string[]) {
      this.serverModList = mods
      this.detectModListChange(mods)
    },
    forceUpdateModInfo(id?: string) {
      if (id) {
        this.cache[id].lastDetectionTime = '0'
        this.detectModInfoChange(id)
      }
      else {
        this.serverModList.forEach((modId) => {
          this.cache[modId].lastDetectionTime = '0'
        })
        this.detectModListChange(this.serverModList)
      }
    },
  },
})
