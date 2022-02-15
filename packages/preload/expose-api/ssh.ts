import type { Config, NodeSSH as NodeSSHType } from 'node-ssh'
const { NodeSSH } = require('node-ssh')

export interface SSHOperateType {
  serverPath: string
  cluster: number
  connect: (config: Config) => Promise<NodeSSHType>
  getServerSetupMods: () => Promise<string[]>
  getServerSetupModCollection: () => Promise<string[]>
  getAllModInfo: () => Promise<string>
}

const ssh = new NodeSSH() as NodeSSHType
const SSHOperate: SSHOperateType = {
  serverPath: '/root/steamcmd/~/myDSTserver',
  cluster: 1,
  async connect(config: Config) {
    return await ssh.connect(config)
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

export default SSHOperate
