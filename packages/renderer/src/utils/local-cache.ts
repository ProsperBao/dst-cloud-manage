import { store } from './electron-store'

const invoke = (felid: string, ...args: any[]) => window.ipcRenderer.invoke('local-cache', felid, ...args)
export const localCache = {
  getSteamMod: async(modSteamId: string, steamLanguage = 'schinese') => await invoke('getSteamMod', modSteamId, steamLanguage),
  translate: async(text = 'hello world', isHtml = false) => {
    const config = await store.get('config-translate')
    if (!config) return ''
    return await invoke('local-cache', 'translate', text, isHtml, config)
  },
}
