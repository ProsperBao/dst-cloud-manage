import { defineStore } from 'pinia'
import type { Mod, ModConfig } from 'dst'
import { i18n } from '../modules/i18n'
import { store } from '../utils/electron-store'
import { localCache } from '../utils/local-cache'
import { sshOperate } from '../utils/ssh-operate'
import { sleep } from '../utils/time'
import { useClusterStore } from './cluster'

const MAX_DETECTION_NUM = 3

export const useModStore = defineStore('mod', {
  state: (): {
    _list: Record<string, Mod>
    loading: string[]
    serverList: string[]
    lockModFunc: boolean
    specialModCluster: boolean
  } => ({
    _list: {},
    loading: [],
    serverList: [],
    lockModFunc: false,

    specialModCluster: true,
  }),
  getters: {
    list: (state): Mod[] => {
      return state.serverList.map((id: string) => state._list[id] || { id })
    },
  },
  actions: {
    /**
     * Get mod information from steam workshop
     * @param id steam workshop id
     * @returns mod info
     */
    async updateMod(id: string): Promise<Mod> {
      const steamLanguage = (i18n.global as any).t('other.steamLanguage')
      this.loading.push(id)

      const mod: Mod = JSON.parse(await localCache.getSteamMod(id, steamLanguage))

      this.loading = this.loading.filter(i => i !== id)
      return mod
    },
    /**
     * Whether mod exists or cache is valid
     * @param id steam workshop id
     * @returns mod info
     */
    async detectMod(id: string, save = true): Promise<Mod> {
      const mod = this._list[id]
      // whether it is within the cache validity period
      if (mod?.lastDetectionTime) {
        const lastDetectionTime = Number(mod.lastDetectionTime)
        const now = new Date().getTime()
        if (now - lastDetectionTime < 1000 * 60 * 60 * 12) {
          this.loading = this.loading.filter(i => i !== id)
          return mod
        }
      }
      const res = await this.updateMod(id)

      if (save) {
        this._list[id] = res
        this._list[id].originConfig = await this.patchModConfig(id)
        await store.set('mod-list', this._list)
      }
      return res
    },
    /**
     * Detect mod list cache is valid
     */
    async detectModList() {
      const queue: string[][] = []
      const tempCache: Record<string, Mod> = {}

      for (let i = 0; i < this.serverList.length; i += MAX_DETECTION_NUM)
        queue.push(this.serverList.slice(i, i + MAX_DETECTION_NUM))

      for (const queueItem of queue) {
        const res = await Promise.all(queueItem.map(id => this.detectMod(id, false)))
        res.forEach((mod) => {
          tempCache[mod.id] = mod
        })
        this.$patch({ _list: { ...tempCache } })
        store.set('mod-list', this._list)
      }
      this.patchAllModConfig()
    },
    /**
     * Force an update to the cache
     * @param id mod id
     */
    async forceUpdate(id?: string) {
      if (id) {
        this._list[id].lastDetectionTime = '0'
        this._list[id].originConfig = undefined
        this._list[id] = await this.detectMod(id)
      }
      else {
        this.serverList.forEach((id) => {
          this._list[id].lastDetectionTime = '0'
          this._list[id].originConfig = undefined
        })
        await this.detectModList()
      }
    },

    /**
     * transform mod description
     * @param id mod id
     */
    async translate(id: string) {
      const mod = { ...this._list[id] }
      this.loading.push(id)
      try {
        let res = await localCache.translate(mod.title, false)
        if (res)
          mod.title = res
        await sleep(1100)
        res = await localCache.translate(mod.steamDescription, true)
        if (res)
          mod.steamDescription = res
      }
      catch {
        console.log(`Failed to translate mod info for ${id}`)
      }
      this.$patch({ _list: { [id]: mod } })
      store.set('mod-list', this._list)
      this.loading = this.loading.filter(i => i !== id)
    },
    async translateConfig(id: string) {
      const mod = { ...this._list[id] }
      this.loading.push(id)
      if (mod.originConfig) {
        const translateContent = mod.originConfig
          .map(config => `${config.label}↔️${config.hover || '❌'}↔️${config.options.map(option => option.hover).join('↕️')}`)
          .join('↩️\n')
          .replace(/\n/g, '')
        const res = (await localCache.translate(translateContent, false)).split('↩️')
        mod.originConfig = mod.originConfig.map((config, idx) => {
          const [label, hover, options] = res[idx].split('↔️')
          const optionList = (options || '').split('↕️')
          return { ...config, label, hover: hover !== '❌' ? hover : '', options: config.options.map((oItem, oIdx) => ({ ...oItem, hover: optionList[oIdx] })) }
        })
      }
      this.$patch({ _list: { [id]: mod } })
      store.set('mod-list', this._list)
      this.loading = this.loading.filter(i => i !== id)
    },

    /**
     * 获取模组配置文件数据并处理
     * @param id mod id
     */
    async patchModConfig(id: string): Promise<ModConfig[]> {
      try {
        const modConfig = await sshOperate.getModConfig(id)
        return modConfig.map((item: any) => {
          return {
            ...item,
            default: `${item.default}`,
            options: item.options.map((i: { description: any; data: any; hover: any }) => ({ label: i.description, value: `${i.data}`, hover: i.hover })),
          }
        })
      }
      catch {
        return []
      }
    },
    async patchAllModConfig() {
      for (const id of this.serverList)
        this._list[id].originConfig = await this.patchModConfig(id)
      store.set('mod-list', this._list)
    },
    // 初始化数据
    async initState() {
      this.serverList = await sshOperate.getSetupMods()
      try {
        const val = await store.get('mod-list')
        if (!Object.keys(val).length)
          this._list = {}
        else
          this._list = val
        this.detectModList()
        this.setLockModFunc(false)
      }
      catch {
        this.setLockModFunc(true)
      }
    },
    // 模组功能上锁
    setLockModFunc(lockModFunc: boolean) {
      this.lockModFunc = lockModFunc
    },
    // 专门用来获取模组配置
    async execSpecialModConfigCluster() {
      return await sshOperate.execSpecialModConfigCluster()
    },
    async subscriptMod(id: string) {
      // 添加模组订阅
      await sshOperate.subscriptMod(id)
      // 启用模组更新专用存档
      await sshOperate.execSpecialModConfigCluster()
      // 强制更新模组
      await this.forceUpdate(id)
    },
  },
})
