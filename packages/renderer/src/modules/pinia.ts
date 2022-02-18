import { createPinia } from 'pinia'
import type { UserModule } from '../types'
import { useModStore } from '../store/mod'
import { store } from '../utils/electron-store'

const initStore = async() => {
  await window.ssh.connect(await store.get('config-server'))
  const mod = useModStore()
  const serverList = await window.ssh.getServerSetupMods()
  await mod.initState(serverList)
}

export const install: UserModule = ({ app }) => {
  const pinia = createPinia()
  initStore()
  app.use(pinia)
}
