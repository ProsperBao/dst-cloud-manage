import { ipcMain } from 'electron'

const axios = require('axios')

export interface LocalCache {
  getModInfoBySteamModId: (modSteamId: string) => Promise<void>
}

export const localCache = {
  async getModInfoBySteamModId(modSteamId: string) {
    const modInfoUrl = `https://steamcommunity.com/sharedfiles/filedetails?id=${modSteamId}`
    try {
      const res = await axios.get(modInfoUrl)
      return JSON.stringify(res.data)
    }
    catch (e) {
      console.log(e)
    }
  },
}
ipcMain.handle(
  'local-cache',
  async(_event, methodSign: string, ...args: any[]) => {
    if (typeof (localCache as any)[methodSign] === 'function')
      return (localCache as any)[methodSign](...args)

    return (localCache as any)[methodSign]
  },
)
