import { createPinia } from 'pinia'
import type { UserModule } from '../types'
import { useConfigStore } from '../store/config'
import { ssh } from '../utils/ssh-operate'

const initStore = async() => {
  const config = useConfigStore()
  await config.initState()
  ssh.connect()
}

export const install: UserModule = ({ app }) => {
  const pinia = createPinia()
  app.use(pinia)
  initStore()
}
