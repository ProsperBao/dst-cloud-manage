import type { ClusterItem, ClusterModConfigItem, ClusterModConfigOptions, ClusterState } from 'dst'
import { defineStore } from 'pinia'
import { sshOperate } from '../utils/ssh-operate'
import { useModStore } from './mod'

export const useClusterStore = defineStore('cluster', {
  state: (): ClusterState => ({
    list: [], // 存档列表
  }),
  getters: {},
  actions: {
    /**
     * 覆盖本地存档列表
     * @param list 存档列表
     */
    setClusterList(list: ClusterItem[]) {
      this.list = list
    },
    /**
     * 获取服务器上所有的存档
     */
    async getClusterList() {
      const res = await sshOperate.getClusterList() // ['Cluster_1', ...]
      const list = []
      for (const cluster of res) {
        // 获取存档扩展属性
        const { token, adminList } = await sshOperate.getClusterInfo(cluster)
        list.push({
          id: cluster,
          config: await sshOperate.getClusterConfig(cluster), // 存档配置
          token,
          adminList,
          modConfig: await sshOperate.getClusterModConfig(cluster), // 存档模组配置
        })
      }
      this.setClusterList(list)
    },
    /**
     * 应用存档模组配置
     * @param cluster 存档 id
     */
    async applyModConfig(cluster: string): Promise<boolean> {
      const modStore = useModStore()
      const clusterModConfig = this.list.filter(item => item.id === cluster)[0].modConfig
      const config = `return {\n${modStore.serverList.map((id) => {
        let applyConfig = clusterModConfig[id]
        const originConfig = modStore._list[id].originConfig || []
        if (!applyConfig) {
          applyConfig = { configuration_options: {}, enabled: false }
          applyConfig.configuration_options = originConfig.reduce((acc, item) => {
            acc[item.name] = item.default
            return acc
          }, {} as ClusterModConfigOptions)
        }
        const options = applyConfig.configuration_options || {}
        return `\t["workshop-${id}"] = {\n\t\tconfiguration_options = {\n${
          Object.keys(options).map((key) => {
            let value = options[key]
            // 非布尔值转换为字符串
            if (typeof (value) !== 'boolean')
              value = `"${value}"`
            // lua 关键字必须要额外处理
            const retain = ['and', 'break', 'do', 'else', 'elseif', 'end', 'false', 'for', 'function', 'if', 'in', 'local', 'nil', 'not', 'or', 'repeat', 'return', 'then', 'true', 'until', 'while', 'goto']
            if (key.includes(' ') || retain.includes(key))
              key = `["${key}"]`
            return `\t\t\t${key || '[""]'} = ${value}`
          }).join(',\n')
        }\n\t\t},\n\t\tenabled = ${
          applyConfig.enabled || false
        }\n\t}`
      }).join(',\n')}\n}`
      return await sshOperate.applyClusterModConfig(cluster, config)
    },
    /**
     * 设置存档模组配置
     * @param cluster 存档 id
     * @param modId 模组 id
     * @param options 模组配置想
     */
    setClusterModConfig(cluster: string, modId: string, options: ClusterModConfigItem) {
      const clusterModConfig = this.list.filter(item => item.id === cluster)[0].modConfig
      clusterModConfig[modId] = options
    },
  },
})
