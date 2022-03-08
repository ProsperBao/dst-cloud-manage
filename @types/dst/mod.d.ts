export interface Mod {
  title?: string
  steamDescription?: string
  id: string
  icon?: string
  size?: string
  lastUpdateDate?: string
  releaseDate?: string
  lastDetectionTime?: string
  originConfig?: ModConfig[]
  [key: string]: string | undefined | ModConfig[]
}

export interface ModConfig {
  default: boolean
  hover: string
  label: string
  name: string
  options: ModConfigOption[]
}
export interface ModConfigOption {
  data?: boolean | number
  description?: string
  hover?: string
  value: boolean | number
  label: string
}
