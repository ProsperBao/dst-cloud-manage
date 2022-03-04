import { useConfigStore } from '../store/config'

const invoke = (felid: string, ...args: any[]) => window.ipcRenderer.invoke('local-cache', felid, ...args)
export const localCache = {
  getSteamMod: async(modSteamId: string, steamLanguage = 'schinese') => await invoke('getSteamMod', modSteamId, steamLanguage),
  translate: async(text = 'hello world', isHtml = false) => {
    const config = useConfigStore()
    if (!config.translate) return ''
    return await invoke('translate', text, isHtml, { ...config.translate })
  },
}
