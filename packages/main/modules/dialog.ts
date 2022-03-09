import { dialog, ipcMain } from 'electron'

ipcMain.handle(
  'dialog',
  async(_event, methodSign: string, ...args: any[]) => {
    if (typeof (dialog as any)[methodSign] === 'function')
      return (dialog as any)[methodSign](...args)

    return (dialog as any)[methodSign]
  },
)
