import type { ClusterCreateConfig, ModConfig } from 'dst'
import type { Config } from 'node-ssh'
import { last } from 'lodash'
import { QuicklyInstallStep } from '../types/dst'
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
  // #region 服务器模组相关
  /**
   * 获取服务器指定模组的配置文件选项
   * @param id 模组 id
   * @returns 模组配置如果没有则为 {}
   */
  async getModConfig(id: string): Promise<ModConfig[]> {
    let path = `steamcmd/~/myDSTserver/ugc_mods/mod_config/Master/content/322330/${id}/modinfo.lua`
    let res = await invoke('gatFileContent', path)
    if ((res ?? '') === '') {
      path = `steamcmd/~/myDSTserver/mods/workshop-${id}/modinfo.lua`
      res = await invoke('gatFileContent', path)
    }
    if (!res.includes('configuration_options')) return []
    try {
      return JSON.parse(await invoke('runLua', `function mod${id}()\n${res}\nreturn json.stringify(configuration_options)\nend\nreturn mod${id}()`))
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
    const path = 'steamcmd/~/myDSTserver/mods/dedicated_server_mods_setup.lua'
    const res = await invoke('gatFileContent', path)
    return res.split('\r\n').filter((mod: string) => !mod.includes('--') && mod.includes('ServerModSetup')).map((mod: string) => mod.split('\"')[1])
  },
  /**
   * 服务器订阅模组集合
   * @returns 服务器订阅模组集合
   */
  async getSetupModCollection(): Promise<string[]> {
    const path = 'steamcmd/~/myDSTserver/mods/dedicated_server_mods_setup.lua'
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
    const res = await invoke('getDirectoryList', '~/.klei/DoNotStarveTogether', false)
    return res.filter((path: string) => !path.includes('mod_config') && !path.includes('.'))
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
    const res = await invoke('gatFileContent', path) || 'return {}'
    try {
      return JSON.parse(await invoke('runLua', `function modConfig()\nreturn json.stringify(${res.substring(7).replace(/workshop-/g, '')})\nend\nreturn modConfig()`))
    }
    catch {
      return {}
    }
  },
  async applyClusterModConfig(cluster: string, config: string): Promise<boolean> {
    const path = `~/.klei/DoNotStarveTogether/${cluster}/modoverrides.lua`
    return await invoke('echoContent2File', path, config)
  },
  async backupCluster(cluster: string, path: string): Promise<boolean> {
    await invoke('execCommand', 'mkdir ~/BackupCluster')
    try {
      await invoke('execCommand', `cd ~/.klei/DoNotStarveTogether && tar -zcvf ./Backup_${cluster}.tar.gz ./${cluster}`)
      await invoke('execCommand', `mv ~/.klei/DoNotStarveTogether/Backup_${cluster}.tar.gz ~/BackupCluster`)
      await invoke('downloadFile', `${path}/Backup_${cluster}.tar.gz`, `/root/BackupCluster/Backup_${cluster}.tar.gz`)
      return true
    }
    catch {
      return false
    }
  },
  async createCluster(cluster: string, config: ClusterCreateConfig): Promise<void> {
    await invoke('createDirDirectory', '~/.klei')
    await invoke('createDirDirectory', '~/.klei/DoNotStarveTogether')
    await invoke('createDirDirectory', `~/.klei/DoNotStarveTogether/${cluster}`)
    await invoke('createDirDirectory', `~/.klei/DoNotStarveTogether/${cluster}/Master`)
    await invoke('createDirDirectory', `~/.klei/DoNotStarveTogether/${cluster}/Caves`)
    await invoke('echo2File', ini.stringify(config.cluster), `~/.klei/DoNotStarveTogether/${cluster}/cluster.ini`)
    await invoke('echo2File', ini.stringify(config.master), `~/.klei/DoNotStarveTogether/${cluster}/Master/server.ini`)
    await invoke('echo2File', ini.stringify(config.caves), `~/.klei/DoNotStarveTogether/${cluster}/Caves/server.ini`)
  },
  async deleteCluster(cluster: string): Promise<boolean> {
    const time = new Date().getTime()
    // 预先备份，避免小傻瓜直接删了
    await invoke('execCommand', 'mkdir ~/BackupCluster')
    try {
      await invoke('execCommand', `cd ~/.klei/DoNotStarveTogether && tar -zcvf ./Backup_${cluster}_${time}.tar.gz ./${cluster}`)
      await invoke('execCommand', `mv ~/.klei/DoNotStarveTogether/Backup_${cluster}_${time}.tar.gz ~/BackupCluster`)
      await invoke('execCommand', `rm -rf ~/.klei/DoNotStarveTogether/${cluster}`)
      return true
    }
    catch {
      return false
    }
  },
  // #endregion

  // #region 服务器一键部署/更新模组相关
  /**
   * 执行专门用来升级模组
   * @returns 是否执行成功
   */
  async createSpecialModConfigCluster(): Promise<boolean> {
    try {
      const clusters = await invoke('getDirectoryList', '~/.klei/DoNotStarveTogether', false)
      if (!clusters.includes('mod_config')) {
        await invoke('createDirDirectory', '~/.klei')
        await invoke('createDirDirectory', '~/.klei/DoNotStarveTogether')
        await invoke('createDirDirectory', '~/.klei/DoNotStarveTogether/mod_config')
        await invoke('createDirDirectory', '~/.klei/DoNotStarveTogether/mod_config/Master')
        await invoke('createDirDirectory', '~/.klei/DoNotStarveTogether/mod_config/Caves')
        await invoke('echo2File', '', '~/.klei/DoNotStarveTogether/mod_config/cluster.ini')
        await invoke('echo2File', '', '~/.klei/DoNotStarveTogether/mod_config/Master/server.ini')
        await invoke('echo2File', '', '~/.klei/DoNotStarveTogether/mod_config/Caves/server.ini')
      }
      invoke('exec', 'cd steamcmd/~/myDSTserver/bin && ./dontstarve_dedicated_server_nullrenderer -cluster "mod_config"', 'update-mod-config')
      for (let i = 0; i < 60 * 30; i++) {
        const log = await invoke('queryExecLog', 'update-mod-config')
        if (/Your Server Will Not Start/.test(log))
          break
        if (log === 'fail') return false
        await sleep(1000)
      }
      await invoke('execCommand', 'pkill -9 dontstarve')
      return true
    }
    catch {
      return false
    }
  },
  /**
   * 执行一键安装步骤
   * @param step 步骤
   * @returns 是否执行成功
   */
  async quicklyInstallStep(step: QuicklyInstallStep): Promise<boolean> {
    switch (step) {
      // 升级系统包管理工具/更新源
      case QuicklyInstallStep.UPDATE_PACKAGE: return await invoke('execCommand', 'apt-get update')
      // 安装必要的依赖组件
      case QuicklyInstallStep.INSTALL_DEPEND: return await invoke('execCommand', 'apt-get install screen libstdc++6 libgcc1 libstdc++6:i386 libgcc1:i386 libcurl4-gnutls-dev:i386 -y')
      // 下载 SteamCMD
      case QuicklyInstallStep.DOWNLOAD_STEAM_CMD: {
        await invoke('execCommand', 'mkdir ~/steamcmd')
        await invoke('execCommand', 'rm -rf steamcmd_linux.tar.gz')
        await invoke('execCommand', 'wget -P ~/steamcmd https://steamcdn-a.akamaihd.net/client/installer/steamcmd_linux.tar.gz')
        return true
      }
      // 解压 SteamCMD
      case QuicklyInstallStep.INSTALL_STEAM_CMD: return await invoke('execCommand', 'tar -xvzf ~/steamcmd/steamcmd_linux.tar.gz -C ~/steamcmd')
      // 安装 DST 服务器，时间较久需要分步返回数据，需要轮训日志判断结果
      case QuicklyInstallStep.DOWNLOAD_DST_SERVER: return invoke('exec', 'bash ~/steamcmd/steamcmd.sh +force_install_dir steamcmd/~/myDSTserver +login anonymous +app_update 343050 validate +quit', 'download-dst-server')
      default: return false
    }
  },
  /**
   * 获取 DST Server 安装进度
   * @returns 安装进度
   */
  async getDstInstallProgress(): Promise<number> {
    const resultLog: string = await invoke('queryExecLog', 'download-dst-server') || ''
    // 失败直接返回 -1
    if (resultLog === 'fail') return -1

    const log = resultLog.split('\n')

    // 判断安装是否成功
    if (resultLog.includes('fully installed')) return 100

    let end = last(log) || ''
    // 判断最后一项有没有结果
    if (!end.includes('progress')) {
      for (let i = log.length - 1; i >= log.length - 3; i--) {
        if (log?.[i]?.includes('progress')) {
          end = log[i]
          break
        }
      }
    }
    // 获取安装进度
    if (end.includes('progress')) {
      const progress = end.match(/:(.*?)\(/)
      return parseInt(`${progress?.[1] || ''}`.trim())
    }

    return 0
  },
  /**
   * 获取执行日志
   * @param flag 日志标识
   * @returns 执行日志
   */
  async queryExecLog(flag: string): Promise<string> {
    return await invoke('queryExecLog', flag)
  },
  // #endregion
}
