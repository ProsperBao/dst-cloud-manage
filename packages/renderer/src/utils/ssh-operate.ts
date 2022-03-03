import type { Config } from 'node-ssh'
import { useConfigStore } from '../store/config'

const invoke = (felid: string, ...args: any[]) => window.ipcRenderer.invoke('ssh-operate', felid, ...args)

export const sshOperate = {
  connect: async(config: Config) => {
    const store = useConfigStore()
    try {
      await invoke('connect', config)
      store.lockFunc = false
    }
    catch {
      store.lockFunc = true
    }
  },
  testConnect: async(config: Config): Promise<void> => await invoke('testConnect', config),
  getServerSetupMods: async(ServerSetupPath: string): Promise<string[]> => await invoke('getServerSetupMods', ServerSetupPath),
  getServerSetupModCollection: async(ServerSetupPath: string): Promise<string[]> => await invoke('getServerSetupModCollection', ServerSetupPath),
  serverGetModConfig: async(ServerSetupPath: string, cluster = 1, id: string): Promise<string> => await invoke('serverGetModConfig', ServerSetupPath, cluster, id),
  serverGetApplyConfig: async(cluster = 1): Promise<string> => await invoke('serverGetApplyConfig', cluster),
  updateSystemOrigin: async(): Promise<string> => await invoke('updateSystemOrigin'),
  installDepend: async(): Promise<string> => await invoke('installDepend'),
  downloadSteamCMD: async(): Promise<string> => await invoke('downloadSteamCMD'),
  installSteamCMD: async(): Promise<string> => await invoke('installSteamCMD'),
  installServerClient: async(): Promise<boolean> => await invoke('installServerClient'),
  currentServerInstallProgress: async(): Promise<number> => await invoke('currentServerInstallProgress'),
  currentServerInstallLog: async(): Promise<string> => await invoke('currentServerInstallLog'),
  initServerClient: async(): Promise<boolean> => await invoke('initServerClient'),
}
