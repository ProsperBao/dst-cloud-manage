import { ipcMain } from 'electron'

import { MD5 } from 'crypto-js'

import type { Translate } from 'packages/renderer/src/store/config'
import type { Mod } from '../../renderer/src/store/mod'

const axios = require('axios')

export interface LocalCache {
  getSteamMod: (modId: string) => Promise<string>
}

export const localCache = {
  async getSteamMod(id: string, steamLanguage = 'schinese'): Promise<string> {
    const modInfoUrl = `https://steamcommunity.com/sharedfiles/filedetails?id=${id}`
    try {
      const { data } = await axios.get(modInfoUrl, {
        headers: {
          Cookie: `Steam_Language=${steamLanguage}`,
          // 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36 Edg/95.0.1020.53',
        },
        timeout: 5000,
      })
      return JSON.stringify(localCache.handleModHtml(data, id))
    }
    catch (e) {
      console.log(e)
      return JSON.stringify({ id })
    }
  },
  /**
   * handle mod info by html
   * @param htmlContent HTML content of the mod page
   * @param modId mod id
   * @returns handled mod info
   */
  handleModHtml(htmlContent: string, modId: string): Mod {
    const sizeAndDate = [...htmlContent.matchAll(/<div class="detailsStatRight">(.*?)<\/div>/g)].map(i => i[1])
    const alternativeIcon = htmlContent.match(/<img id="previewImage" class="workshopItemPreviewImageEnlargeable" src="(.*?)"/)?.[1] ?? ''
    return {
      id: modId,
      title: htmlContent.match(/<div class="workshopItemTitle">(.*?)<\/div>/)?.[1] ?? '',
      icon: htmlContent.match(/class="workshopItemPreviewImageMain" src="(.*?)"/)?.[1] ?? alternativeIcon ?? '',
      size: sizeAndDate?.[0] || '',
      releaseDate: sizeAndDate?.[1] || '',
      lastUpdateDate: sizeAndDate?.[2] || '',
      steamDescription: htmlContent.match(/<div class="workshopItemDescription" id="highlightContent">(.*?)<\/div>/)?.[1] ?? '',
      lastDetectionTime: new Date().getTime().toString(),
    }
  },
  async translate(text: string, isHtml = false, { from, to, appid, key }: Translate) {
    const temp: string[] = []
    let transBefore = text
    if (isHtml) {
      transBefore = transBefore.replace(/<[^>]+>/g, (tag) => {
        temp.push(tag)
        return '↩️'
      })
    }
    const salt = (new Date()).getTime()
    const str = appid + transBefore + salt + key
    const sign = MD5(str).toString()

    const data = {
      q: transBefore,
      appid,
      salt,
      from,
      to,
      sign,
    }
    const res = await axios.get('http://api.fanyi.baidu.com/api/trans/vip/translate', { params: data })
    let transAfter = res.data.trans_result[0].dst
    if (isHtml) {
      temp.forEach((tag) => {
        transAfter = transAfter.replace('↩️', tag)
      })
    }

    return transAfter
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
