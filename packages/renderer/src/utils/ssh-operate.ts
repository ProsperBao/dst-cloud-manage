import { useConfigStore } from '../store/config'
import { useModStore } from '../store/mod'

export const ssh = {
  async connect() {
    const mod = useModStore()
    const config = useConfigStore()
    try {
      await window.ssh.connect({ ...config.server })
      const serverList = await window.ssh.getServerSetupMods()
      mod.initState(serverList)
    }
    catch {
      config.lockFunc = true
    }
  },
}
