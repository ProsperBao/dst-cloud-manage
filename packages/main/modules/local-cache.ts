import { ipcMain } from 'electron'

const axios = require('axios')

export interface LocalCache {
  getModInfoBySteamModId: (modId: string) => Promise<string>
}

export interface ModInfo {
  title?: string
  description?: string
  id: string
  icon?: string
  size?: string
  lastUpdateDate?: string
  releaseDate?: string
}

export const localCache = {
  async getModInfoBySteamModId(modId: string): Promise<string> {
    const modInfoUrl = `https://steamcommunity.com/sharedfiles/filedetails?id=${modId}`
    try {
      const { data } = await axios.get(modInfoUrl)
      return JSON.stringify(localCache.handleModInfoByHtml(data, modId))
    }
    catch (e) {
      return ''
    }
  },
  /**
   * handle mod info by html
   * @param htmlContent HTML content of the mod page
   * @param modId mod id
   * @returns handled mod info
   */
  handleModInfoByHtml(htmlContent: string, modId: string): ModInfo {
    const sizeAndDate = [...htmlContent.matchAll(/<div class="detailsStatRight">(.*?)<\/div>/g)].map(i => i[1])
    return {
      id: modId,
      title: htmlContent.match(/<div class="workshopItemTitle">(.*?)<\/div>/)?.[1] ?? '',
      icon: htmlContent.match(/class="workshopItemPreviewImageMain" src="(.*?)"/)?.[1] ?? '',
      size: sizeAndDate?.[1] || '0.0KB',
      lastUpdateDate: sizeAndDate?.[2] || '0',
      releaseDate: sizeAndDate?.[3] || '0',
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
