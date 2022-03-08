export interface ClusterState{
  list: ClusterItem[] // 存档列表
}

// 存档模组配置
export interface ClusterModConfig {
  enabled: boolean // 启用状态
  configuration_options: Record<string, boolean | number | string> // 配置选项
}

// 基础存档属性
export interface BaseClusterItem{
  id: string // 存档全名
  config?: Record<string, Record<string, string>> // 存档配置
}

// 存档扩展属性
export interface ClusterItem extends BaseClusterItem{
  token: string // 存档 Token
  adminList: string[] // 管理员列表
  modConfig: Record<string, ClusterModConfig> // 模组配置
}
