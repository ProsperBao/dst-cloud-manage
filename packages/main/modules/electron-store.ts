import { ipcMain } from 'electron'
import Store from 'electron-store'

const store = new Store()
ipcMain.handle(
  'electron-store',
  async(_event, methodSign: string, ...args: any[]) => {
    if (typeof (store as any)[methodSign] === 'function')
      return (store as any)[methodSign](...args)

    return (store as any)[methodSign]
  },
)
