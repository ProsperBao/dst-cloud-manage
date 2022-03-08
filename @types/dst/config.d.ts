
export interface Translate {
  appid?: string
  key?: string
  from?: string
  to?: string
}
export interface ServerExtra {
  setup?: string
  cluster?: number
}
export interface ConfigState{
  server: Config
  translate: Translate
  serverExtra: ServerExtra
  lockFunc: boolean
  [key: string]: Config | Translate | ServerExtra| boolean
}

export type stateKey = keyof ConfigState
