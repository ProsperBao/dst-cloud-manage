const { invoke } = window.ipcRenderer

export type { ModInfo } from '../../../main/modules/local-cache'

export const localCache = {
  async getModInfoBySteamModId(modSteamId: string, steamLanguage = 'schinese') {
    return await invoke('local-cache', 'getModInfoBySteamModId', modSteamId, steamLanguage)
  },
}
