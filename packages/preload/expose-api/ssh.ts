import type { Config, NodeSSH as NodeSSHType } from 'node-ssh'
const { NodeSSH } = require('node-ssh')

export interface SSHOperateType {
  serverPath: string
  cluster: number
  connect: (config: Config) => Promise<NodeSSHType>
  testConnect: (config: Config) => Promise<NodeSSHType>
  getServerSetupMods: () => Promise<string[]>
  getServerSetupModCollection: () => Promise<string[]>
  getAllModInfo: () => Promise<string>
}

const ssh = new NodeSSH() as NodeSSHType
const SSHOperate1: SSHOperateType = {
  serverPath: '/root/steamcmd/~/myDSTserver',
  cluster: 1,
  async connect(config: Config) {
    return await ssh.connect(config)
  },
  async testConnect(config: Config) {
    const test = new NodeSSH() as NodeSSHType
    return await test.connect(config)
  },
  /**
   * get server setup mods
   * @returns mods
   */
  async getServerSetupMods() {
    const serverModsSetup = `${SSHOperate.serverPath}/mods/dedicated_server_mods_setup.lua`
    const mods = await ssh.execCommand(`cat ${serverModsSetup}`)
    if ((mods.stdout ?? '') !== '')
      return mods.stdout.split('\r\n').filter((mod: string) => !mod.includes('--') && mod.includes('ServerModSetup')).map((mod: string) => mod.split('\"')[1])

    else
      return []
  },
  /**
   * get server setup mod collection
   * @returns mod collection
   */
  async getServerSetupModCollection() {
    const serverModsSetup = `${SSHOperate.serverPath}/mods/dedicated_server_mods_setup.lua`
    const mods = await ssh.execCommand(`cat ${serverModsSetup}`)
    if ((mods.stdout ?? '') !== '')
      return mods.stdout.split('\r\n').filter((mod: string) => !mod.includes('--') && mod.includes('ServerModCollectionSetup')).map((mod: string) => mod.split('\"')[1])

    else
      return []
  },
  /**
   * get all mod info
   * @returns mod info
   */
  async getAllModInfo() {
    const mods = await SSHOperate.getServerSetupMods()
    console.log(mods)
    return ''
  },
}

export default SSHOperate1

export class SSHOperate {
  connection: NodeSSHType | null = null

  constructor() {
    this.connection = new NodeSSH() as NodeSSHType
  }

  private getConnection(): NodeSSHType {
    const { connection } = this
    if (connection == null) throw new Error('Not connected to server')
    return connection
  }

  async connect(config: Config) {
    const connection = this.getConnection()
    await connection.connect(config)
  }

  static async testConnect(config: Config) {
    const tempConnection = new NodeSSH() as NodeSSHType
    await tempConnection.connect(config)
  }

  async getServerSetupMods(ServerSetupPath: string) {
    const connection = this.getConnection()
    const path = `${ServerSetupPath}/mods/dedicated_server_mods_setup.lua`
    const mods = await connection.execCommand(`cat ${path}`)
    if ((mods.stdout ?? '') !== '')
      return mods.stdout.split('\r\n').filter((mod: string) => !mod.includes('--') && mod.includes('ServerModSetup')).map((mod: string) => mod.split('\"')[1])
    else
      return []
  }

  async getServerSetupModCollection(ServerSetupPath: string) {
    const connection = this.getConnection()
    const path = `${ServerSetupPath}/mods/dedicated_server_mods_setup.lua`
    const mods = await connection.execCommand(`cat ${path}`)
    if ((mods.stdout ?? '') !== '')
      return mods.stdout.split('\r\n').filter((mod: string) => !mod.includes('--') && mod.includes('ServerModCollectionSetup')).map((mod: string) => mod.split('\"')[1])
    else
      return []
  }

  async serverSetupMod2Cache(ServerSetupPath: string, cluster = 1) {
    const connection = this.getConnection()
    const path = `${ServerSetupPath}/ugc_mods/Cluster_${cluster}/Master/content/322330`
    const configs = await connection.execCommand(`cat ${path}`)
    if ((configs.stdout ?? '') !== '')
      return ''
    else
      return {}
  }
}
