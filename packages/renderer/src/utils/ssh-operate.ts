import type { ModConfig } from 'dst'
import type { Config } from 'node-ssh'
import type { IniConfig } from '../../../../utils/ini'
import ini from '../../../../utils/ini'
import { useConfigStore } from '../store/config'
import { sleep } from './time'

const invoke = (felid: string, ...args: any[]) => window.ipcRenderer.invoke('ssh-operate', felid, ...args)

export const sshOperate = {
  connect: async(config: Config) => {
    const store = useConfigStore()
    try {
      await invoke('connect', config)
      store.lockFunc = false
    }
    catch {
      store.lockFunc = true
    }
  },
  testConnect: async(config: Config): Promise<void> => await invoke('testConnect', config),

  updateSystemOrigin: async(): Promise<string> => await invoke('updateSystemOrigin'),
  installDepend: async(): Promise<string> => await invoke('installDepend'),
  downloadSteamCMD: async(): Promise<string> => await invoke('downloadSteamCMD'),
  installSteamCMD: async(): Promise<string> => await invoke('installSteamCMD'),
  installServerClient: async(): Promise<boolean> => await invoke('installServerClient'),
  currentServerInstallProgress: async(): Promise<number> => await invoke('currentServerInstallProgress'),
  currentServerInstallLog: async(): Promise<string> => await invoke('currentServerInstallLog'),
  initServerClient: async(): Promise<boolean> => await invoke('initServerClient'),
  applyServerModConfig: async(config: string, cluster: number): Promise<boolean> => await invoke('applyServerModConfig', config, cluster),

  // #region 服务器模组相关
  /**
   * 获取服务器指定模组的配置文件选项
   * @param id 模组 id
   * @returns 模组配置如果没有则为 {}
   */
  async getModConfig(id: string): Promise<ModConfig[]> {
    const path = `~/steamcmd/~/myDSTserver/ugc_mods/mod_config/Master/content/322330/${id}/modinfo.lua`
    const res = await invoke('gatFileContent', path)
    try {
      return JSON.parse(await invoke('runLua', res))
    }
    catch {
      return []
    }
  },
  /**
   * 服务器订阅模组
   * @returns 服务器订阅模组
   */
  async getSetupMods(): Promise<string[]> {
    const path = '~/steamcmd/~/myDSTserver/mods/dedicated_server_mods_setup.lua'
    const res = await invoke('gatFileContent', path)
    return res.split('\r\n').filter((mod: string) => !mod.includes('--') && mod.includes('ServerModSetup')).map((mod: string) => mod.split('\"')[1])
  },
  /**
   * 服务器订阅模组集合
   * @returns 服务器订阅模组集合
   */
  async getSetupModCollection(): Promise<string[]> {
    const path = '~/steamcmd/~/myDSTserver/mods/dedicated_server_mods_setup.lua'
    const res = await invoke('gatFileContent', path)
    return res.split('\r\n').filter((mod: string) => !mod.includes('--') && mod.includes('ServerModCollectionSetup')).map((mod: string) => mod.split('\"')[1])
  },
  // #endregion

  // #region 服务器存档相关
  /**
   * 存档列表
   * @returns 存档列表 ['xxxx', 'xxxx']
   */
  getClusterList: async(): Promise<string[]> => {
    const res = await invoke('getDirectoryList', 'ls ~/.klei/DoNotStarveTogether', false)
    return res.filter((path: string) => path.includes('Cluster_'))
  },
  /**
   * 获取存档相关扩展配置
   * @param cluster 存档 id
   * @returns 存档相关扩展配置
   */
  getClusterInfo: async(cluster: string): Promise<{ token: string; adminList: string[] }> => {
    const token = await invoke('gatFileContent', `~/.klei/DoNotStarveTogether/${cluster}/cluster_token.txt`)
    const adminList = await invoke('gatFileContent', `~/.klei/DoNotStarveTogether/${cluster}/adminlist.txt`)
    return { token, adminList: adminList.split('\n') }
  },
  /**
   * 存档相关配置
   * @param cluster 存档 id
   * @returns 存档相关配置
   */
  getClusterConfig: async(cluster: string): Promise<IniConfig> => {
    const config = await invoke('gatFileContent', `~/.klei/DoNotStarveTogether/${cluster}/cluster.ini`)
    return ini.parse(config)
  },
  /**
   * 存档模组相关配置
   * @param cluster 存档 id
   * @returns 存档模组相关配置
   */
  async getClusterModConfig(cluster: string): Promise<Record<string, any>> {
    const path = `~/.klei/DoNotStarveTogether/${cluster}/modoverrides.lua`
    const res = await invoke('gatFileContent', path)
    try {
      return JSON.parse(await invoke('runLua', `local configuration_options = ${res.substring(7).replace(/workshop-/g, '')}`))
    }
    catch {
      return {}
    }
  },
  // #endregion

  /**
   * 执行专门用来升级模组
   * @returns 是否执行成功
   */
  async createSpecialModConfigCluster(): Promise<boolean> {
    try {
      const clusters = await invoke('getDirectoryList', '~/.klei/DoNotStarveTogether', false)
      if (!clusters.includes('mod_config')) {
        await invoke('createDirDirectory', '~/.klei/DoNotStarveTogether/mod_config')
        await invoke('createDirDirectory', '~/.klei/DoNotStarveTogether/mod_config/Master')
        await invoke('createDirDirectory', '~/.klei/DoNotStarveTogether/mod_config/Caves')
        await invoke('echo2File', '', '~/.klei/DoNotStarveTogether/mod_config/cluster.ini')
        await invoke('echo2File', '', '~/.klei/DoNotStarveTogether/mod_config/Master/server.ini')
        await invoke('echo2File', '', '~/.klei/DoNotStarveTogether/mod_config/Caves/server.ini')
      }
      invoke('exec', 'cd ~/steamcmd/~/myDSTserver/bin && ./dontstarve_dedicated_server_nullrenderer -cluster "mod_config" -monitor_parent_process', 'update-mod-config')
      for (let i = 0; i < 60 * 30; i++) {
        const log = await invoke('queryExecLog', 'update-mod-config')
        if (/PendingConnection::Reset\(true\)/.test(log))
          break
        await sleep(2000)
      }
      await invoke('execCommand', 'pkill -9 dontstarve')
      return true
    }
    catch {
      return false
    }
  },
}
