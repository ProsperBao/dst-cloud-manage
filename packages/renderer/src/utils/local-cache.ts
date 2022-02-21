import { store } from './electron-store'

const { invoke } = window.ipcRenderer

export const localCache = {
  async getSteamMod(modSteamId: string, steamLanguage = 'schinese') {
    return await invoke('local-cache', 'getSteamMod', modSteamId, steamLanguage)
  },
  async translate(text = 'hello world', isHtml = false) {
    const config = await store.get('config-translate')
    if (!config) return ''
    return await invoke('local-cache', 'translate', text, isHtml, config)
  },
}
