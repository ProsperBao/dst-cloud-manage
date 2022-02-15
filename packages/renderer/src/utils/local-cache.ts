const { invoke } = window.ipcRenderer

export const localCache = {
  async getModInfoBySteamModId(modSteamId: string) {
    return await invoke('local-cache', 'getModInfoBySteamModId', modSteamId)
  },
}
