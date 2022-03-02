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
  testConnect: async(config: Config) => await invoke('testConnect', config),
  getServerSetupMods: async(ServerSetupPath: string) => await invoke('getServerSetupMods', ServerSetupPath),
  getServerSetupModCollection: async(ServerSetupPath: string) => await invoke('getServerSetupModCollection', ServerSetupPath),
  serverGetModConfig: async(ServerSetupPath: string, cluster = 1, id: string) => await invoke('serverGetModConfig', ServerSetupPath, cluster, id),
  serverGetApplyConfig: async(cluster = 1) => await invoke('serverGetApplyConfig', cluster),
  updateSystemOrigin: async() => await invoke('updateSystemOrigin'),
  installDepend: async() => await invoke('installDepend'),
  downloadSteamCMD: async() => await invoke('downloadSteamCMD'),
  installSteamCMD: async() => await invoke('installSteamCMD'),
  installServerClient: async() => await invoke('installServerClient'),

}
