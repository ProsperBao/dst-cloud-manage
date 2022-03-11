import type { Config, NodeSSH as NodeSSHType } from 'node-ssh'
import { ipcMain } from 'electron'
import lua from '../../../utils/lua'

const { NodeSSH } = require('node-ssh')

class SSHOperate {
  connection: NodeSSHType | null = null

  execLog = ''

  quicklyStatus: 'pending' | 'success' | 'fail' |'disabled' = 'disabled'

  cmdLog: Record<string, string> = {}
  cmdStatus: Record<string, string> = {}

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

  static async testConnect(config: Config): Promise<void> {
    const tempConnection = new NodeSSH() as NodeSSHType
    await tempConnection.connect(config)
  }

  // bash cmd
  async getDirectoryList(path: string, includePath = false): Promise<string[]> {
    const connection = this.getConnection()
    const res = await connection.execCommand(`ls ${path}`)
    if (res.stdout)
      return includePath ? res.stdout.split('\n').map(item => item + path) : res.stdout.split('\n')
    else
      return []
  }

  async gatFileContent(path: string): Promise<string> {
    const connection = this.getConnection()
    const res = await connection.execCommand(`cat ${path}`)
    return res.stdout || ''
  }

  async echoContent2File(path: string, content: string): Promise<boolean> {
    const connection = this.getConnection()
    const res = await connection.execCommand(`echo '${content}' > ${path}`)
    return res.stderr === ''
  }

  async createDirDirectory(path: string): Promise<boolean> {
    const connection = this.getConnection()
    const res = await connection.execCommand(`mkdir ${path}`)
    if (res.stdout)
      return true
    else
      return false
  }

  async echo2File(content: string, path: string): Promise<boolean> {
    const connection = this.getConnection()
    const res = await connection.execCommand(`echo "${content}" > ${path}`)
    if (res.stdout)
      return true
    else
      return false
  }

  async execCommand(command: string): Promise<boolean> {
    const connection = this.getConnection()
    const res = await connection.execCommand(command)
    if (res.stderr === '')
      return true
    else
      return false
  }

  async exec(command: string, flag: string): Promise<void> {
    const connection = this.getConnection()
    this.cmdLog[flag] = ''
    connection.exec(command, [], {
      onStdout: (chunk) => {
        this.cmdLog[flag] += chunk.toString('utf8')
      },
      onStderr: () => {
        this.cmdLog[flag] = 'fail'
      },
    })
  }

  queryExecLog(flag: string): string {
    return this.cmdLog[flag] || ''
  }

  async runLua(luaScript: string): Promise<string> {
    try {
      luaScript = luaScript.replace(/󰀀|󰀉|󰀌|\\󰀧/g, '')
      console.log(luaScript)
      return lua.runLua(luaScript)
    }
    catch {
      console.log(luaScript)
      return ''
    }
  }

  downloadFile(localPath: string, remotePath: string): Promise<boolean> {
    const connection = this.getConnection()
    return new Promise((resolve) => {
      connection.getFile(localPath, remotePath)
        .then(() => resolve(true))
        .catch(() => resolve(false))
    })
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
