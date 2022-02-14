import type { Config, NodeSSH as NodeSSHType } from 'node-ssh'
const { NodeSSH } = require('node-ssh')

export interface SSHOperateType {
  connect: (config: Config) => Promise<NodeSSHType>
  getServerMods: (modDir: string, cluster: number) => Promise<string[]>
}

const ssh = new NodeSSH() as NodeSSHType
const SSHOperate: SSHOperateType = {
  async connect(config: Config) {
    return await ssh.connect(config)
  },
  /**
   * get server mods
   * @param serverPath DSTserver path
   * @param cluster archive number
   * @returns mods
   */
  async getServerMods(serverPath: string, cluster: number) {
    const toModsPath = `cd ${serverPath}/ugc_mods/Cluster_${cluster}/Master/content/322330`
    const mods = await ssh.execCommand(`${toModsPath} && ls`)
    return mods.stdout.split('\n').filter(Boolean)
  },
}

export default SSHOperate
