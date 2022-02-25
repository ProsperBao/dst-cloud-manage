import type { Config, NodeSSH as NodeSSHType } from 'node-ssh'
import { ipcMain } from 'electron'

const { NodeSSH } = require('node-ssh')

class SSHOperate {
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
    const serverFilesPath = await connection.execCommand(`find ${path} -name modinfo.lua`)
    if ((serverFilesPath.stdout ?? '') === '') return []
    const filesPath = serverFilesPath.stdout.split('\n')
    const content = await connection.execCommand(`cat ${filesPath[1]}`)
    return content.stdout
  }
}

const ssh = new SSHOperate()
ipcMain.handle(
  'ssh-operate',
  async(_event, methodSign: string, ...args: any[]) => {
    if (typeof (ssh as any)[methodSign] === 'function')
      return (ssh as any)[methodSign](...args)

    return (ssh as any)[methodSign]
  },
)
