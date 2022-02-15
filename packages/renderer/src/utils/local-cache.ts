const { invoke } = window.ipcRenderer

export type { ModInfo } from '../../../main/modules/local-cache'

export const localCache = {
  async getModInfoBySteamModId(modSteamId: string) {
    return await invoke('local-cache', 'getModInfoBySteamModId', modSteamId)
  },
}
