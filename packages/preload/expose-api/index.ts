import fs from 'fs'
import type { ContextBridge } from 'electron'

const setup: Record<string, any> = {
  fs,
}

export function setupExposeApi(contextBridge: ContextBridge) {
  Object.keys(setup).forEach((key) => {
    contextBridge.exposeInMainWorld(key, setup[key])
  })
}
