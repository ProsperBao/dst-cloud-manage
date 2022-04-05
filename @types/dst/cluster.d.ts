export interface ClusterState{
  list: ClusterItem[] // 存档列表
}

// 存档模组配置
export type ClusterModConfigOptions = Record<string, boolean | number | string>
export interface ClusterModConfigItem {
  enabled: boolean // 启用状态
  configuration_options: ClusterModConfigOptions // 配置选项
}
export type ClusterModConfig = Record<string, ClusterModConfigItem>

export type ClusterConfig = Record<string, Record<string, string|boolean|number>>
// 基础存档属性
export interface BaseClusterItem{
  id: string // 存档全名
  config?: ClusterConfig // 存档配置
}

// 存档扩展属性
export interface ClusterItem extends BaseClusterItem{
  token: string // 存档 Token
  adminList: string[] // 管理员列表
  modConfig: ClusterModConfig // 模组配置
}

export type ClusterCreateConfig = Record<string, ClusterConfig>

export interface ClusterConfigOptionsItem {
  type: number
  options?: string[]
}
export type ExClusterConfig = Record<string, ClusterConfigOptionsItem>
export type ClusterConfigOptions = Record<string, ExClusterConfig>
