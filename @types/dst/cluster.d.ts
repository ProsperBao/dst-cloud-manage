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

// 基础存档属性
export interface BaseClusterItem{
  id: string // 存档全名
  config?: Record<string, Record<string, string>> // 存档配置
}

// 存档扩展属性
export interface ClusterItem extends BaseClusterItem{
  token: string // 存档 Token
  adminList: string[] // 管理员列表
  modConfig: ClusterModConfig // 模组配置
}
