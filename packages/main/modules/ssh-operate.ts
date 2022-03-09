import type { Config, NodeSSH as NodeSSHType } from 'node-ssh'
import { ipcMain } from 'electron'
import { last } from 'lodash'
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

  async updateSystemOrigin(): Promise<string> {
    const connection = this.getConnection()
    const res = await connection.execCommand('apt-get update')
    this.execLog = res.stdout || res.stderr
    return this.execLog
  }

  async installDepend(): Promise<string> {
    const connection = this.getConnection()
    const res = await connection.execCommand('apt-get install screen libstdc++6 libgcc1 libcurl4-gnutls-dev libstdc++6:i386 libgcc1:i386 libcurl4-gnutls-dev:i386 -y')
    this.execLog += res.stdout
    return this.execLog
  }

  async downloadSteamCMD(): Promise<string> {
    const connection = this.getConnection()
    let res = await connection.execCommand('mkdir ~/steamcmd')
    this.execLog += res.stdout
    res = await connection.execCommand('wget -P ~/steamcmd https://steamcdn-a.akamaihd.net/client/installer/steamcmd_linux.tar.gz')
    this.execLog += res.stdout
    return this.execLog
  }

  async installSteamCMD(): Promise<string> {
    const connection = this.getConnection()
    const res = await connection.execCommand('tar -xvzf ~/steamcmd/steamcmd_linux.tar.gz -C ~/steamcmd')
    this.execLog += res.stdout
    return this.execLog
  }

  async installServerClient(): Promise<boolean> {
    const connection = this.getConnection()
    this.quicklyStatus = 'pending'
    try {
      await connection.exec('bash ~/steamcmd/steamcmd.sh +force_install_dir ~/myDSTserver +login anonymous +app_update 343050 validate +quit', [], {
        onStdout: (chunk) => {
          this.execLog += chunk.toString('utf8')
        },
        onStderr: (chunk) => {
          this.execLog += chunk.toString('utf8')
        },
      })
    }
    catch {
      if (this.execLog && this.execLog.includes('fully installed')) {
        this.quicklyStatus = 'success'
        return true
      }
      else {
        this.quicklyStatus = 'fail'
      }
    }
    return false
  }

  async currentServerInstallProgress(): Promise<number> {
    const log = this.execLog?.split('\n')
    let end = last(log) || ''
    if (!end.includes('progress')) {
      for (let i = log.length - 1; i >= log.length - 3; i--) {
        if (log[i].includes('progress')) {
          end = log[i]
          break
        }
      }
    }
    if (end.includes('fully installed') || ['success', 'fail'].includes(this.quicklyStatus)) {
      const connection = this.getConnection()
      await connection.execCommand('pkill -９ steam')
      return 100
    }
    else if (end.includes('progress') && this.quicklyStatus === 'pending') {
      const progress = end.match(/:(.*?)\(/)
      return parseInt(`${progress?.[1] || ''}`.trim())
    }
    else if (this.quicklyStatus === 'pending') {
      return 0
    }
    else {
      return -1
    }
  }

  currentServerInstallLog() {
    return this.execLog
  }

  async initServerClient(): Promise<boolean> {
    const connection = this.getConnection()
    return new Promise((resolve) => {
      connection.exec('~/myDSTserver/bin/dontstarve_dedicated_server_nullrenderer', [], {
        onStdout: (chunk) => {
          console.log(chunk.toString('utf8'))
          if (chunk.toString('utf8').includes('Your Server Will Not Start')) {
            connection.execCommand('pkill -9 dontstarve')
            resolve(true)
          }
        },
        onStderr: (chunk) => {
          console.log(chunk.toString('utf8'))
          resolve(false)
        },
      })
    })
  }

  async applyServerModConfig(config: string, cluster = 1): Promise<boolean> {
    const connection = this.getConnection()
    const filePath = `~/.klei/DoNotStarveTogether/Cluster_${cluster}/modoverrides.lua`
    console.log(`rm -rf ${filePath} echo '1' > ${filePath}`)
    const res = await connection.execCommand(`rm -rf ${filePath} & echo '${config}' > ${filePath}`)
    return res.stderr === ''
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
    console.log(res)
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
      onStderr: (chunk) => {
        this.cmdLog[flag] += chunk.toString('utf8')
      },
    })
  }

  queryExecLog(flag: string): string {
    return this.cmdLog[flag] || ''
  }

  async runLua(luaScript: string): Promise<string> {
    return lua.runLua(luaScript)
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
