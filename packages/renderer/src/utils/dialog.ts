import type { OpenDialogOptions } from 'electron'

const invoke = (felid: string, ...args: any[]) => window.ipcRenderer.invoke('dialog', felid, ...args)

export const dialog = {
  async showOpenDialog(options: OpenDialogOptions): Promise<Electron.OpenDialogReturnValue> {
    return await invoke('showOpenDialog', options)
  },
}
