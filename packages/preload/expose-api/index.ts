import fs from 'fs'
import type { ContextBridge } from 'electron'

import ssh from './ssh'

export type { SSHOperateType } from './ssh'

const setup: Record<string, any> = {
  ssh,
  fs,
}

export function setupExposeApi(contextBridge: ContextBridge) {
  Object.keys(setup).forEach((key) => {
    contextBridge.exposeInMainWorld(key, setup[key])
  })
}
