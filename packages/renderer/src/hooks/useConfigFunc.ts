import type { Config } from 'node-ssh'
import { storeToRefs } from 'pinia'
import { useConfigStore } from '../store/config'

export default () => {
  const configStore = useConfigStore()

  const { server } = storeToRefs(configStore)

  const invoke = (felid: string, ...args: any[]) => window.ipcRenderer.invoke('ssh-operate', felid, ...args)

  const connectServer = async(config?: Config): Promise<boolean> => {
    try {
      await invoke('connect', config || toRaw(server.value))
      return configStore.setLockFunc(false)
    }
    catch {
      return configStore.setLockFunc(true)
    }
  }

  const connectServerTest = async(config: Config): Promise<boolean> => {
    try {
      await invoke('testConnect', config)
      return configStore.setLockFunc(false)
    }
    catch {
      return configStore.setLockFunc(true)
    }
  }

  return {
    connectServer,
    connectServerTest,
  }
}
