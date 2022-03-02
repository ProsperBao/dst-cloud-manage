import type { Config, NodeSSH as NodeSSHType } from 'node-ssh'
import { ipcMain } from 'electron'

const { NodeSSH } = require('node-ssh')
const fengari = require('fengari-web')

class SSHOperate {
  connection: NodeSSHType | null = null

  execLog: string | null = null

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

  async serverGetModConfig(ServerSetupPath: string, cluster = 1, id: string) {
    const connection = this.getConnection()
    const path = `${ServerSetupPath}/ugc_mods/Cluster_${cluster}/Master/content/322330/${id}/modinfo.lua`
    const result = await connection.execCommand(`cat ${path}`)
    if (result.stdout)
      return this.runLuaAndReadData(result.stdout)
    else
      return '[]'
  }

  async serverGetApplyConfig(cluster = 1) {
    const connection = this.getConnection()
    const result = await connection.execCommand(`cat ~/.klei/DoNotStarveTogether/Cluster_${cluster}/modoverrides.lua`)
    if (result.stdout)
      return this.runLuaAndReadData(`local configuration_options = ${result.stdout.substring(7).replace(/workshop-/g, '')}`)

    else return '{}'
  }

  runLuaAndReadData(luaScript: string) {
    return fengari.load(`
      ${this.getLuaJsonScript()}
      local locale = "en"
      ${luaScript}
      return json.stringify(configuration_options)
    `)()
  }

  getLuaJsonScript() {
    return `
    function j()
      local json = {}
      local function kind_of(obj)
        if type(obj) ~= 'table' then return type(obj) end
        local i = 1
        for _ in pairs(obj) do
          if obj[i] ~= nil then i = i + 1 else return 'table' end
        end
        if i == 1 then return 'table' else return 'array' end
      end
      local function escape_str(s)
        local in_char  = {'\\\\', '"', '/', '\\b', '\\f', '\\n', '\\r', '\\t'}
        local out_char = {'\\\\', '"', '/',  'b',  'f',  'n',  'r',  't'}
        for i, c in ipairs(in_char) do
          s = s:gsub(c, '\\\\' .. out_char[i])
        end
        return s
      end
      local function skip_delim(str, pos, delim, err_if_missing)
        pos = pos + #str:match('^%s*', pos)
        if str:sub(pos, pos) ~= delim then
          if err_if_missing then
            error('Expected ' .. delim .. ' near position ' .. pos)
          end
          return pos, false
        end
        return pos + 1, true
      end
      local function parse_str_val(str, pos, val)
        val = val or ''
        local early_end_error = 'End of input found while parsing string.'
        if pos > #str then error(early_end_error) end
        local c = str:sub(pos, pos)
        if c == '"'  then return val, pos + 1 end
        if c ~= '\\\\' then return parse_str_val(str, pos + 1, val .. c) end
        local esc_map = {b = '\\b', f = '\\f', n = '\\n', r = '\\r', t = '\\t'}
        local nextc = str:sub(pos + 1, pos + 1)
        if not nextc then error(early_end_error) end
        return parse_str_val(str, pos + 2, val .. (esc_map[nextc] or nextc))
      end
      local function parse_num_val(str, pos)
        local num_str = str:match('^-?%d+%.?%d*[eE]?[+-]?%d*', pos)
        local val = tonumber(num_str)
        if not val then error('Error parsing number at position ' .. pos .. '.') end
        return val, pos + #num_str
      end
      function json.stringify(obj, as_key)
        local s = {}  
        local kind = kind_of(obj)  
        if kind == 'array' then
          if as_key then error('Can\\'t encode array as key.') end
          s[#s + 1] = '['
          for i, val in ipairs(obj) do
            if i > 1 then s[#s + 1] = ', ' end
            s[#s + 1] = json.stringify(val)
          end
          s[#s + 1] = ']'
        elseif kind == 'table' then
          if as_key then error('Can\\'t encode table as key.') end
          s[#s + 1] = '{'
          for k, v in pairs(obj) do
            if #s > 1 then s[#s + 1] = ', ' end
            s[#s + 1] = json.stringify(k, true)
            s[#s + 1] = ':'
            s[#s + 1] = json.stringify(v)
          end
          s[#s + 1] = '}'
        elseif kind == 'string' then
          return '"' .. escape_str(obj) .. '"'
        elseif kind == 'number' then
          if as_key then return '"' .. tostring(obj) .. '"' end
          return tostring(obj)
        elseif kind == 'boolean' then
          return tostring(obj)
        elseif kind == 'nil' then
          return 'null'
        else
          error('Unjsonifiable type: ' .. kind .. '.')
        end
        return table.concat(s)
      end
      json.null = {}  
      function json.parse(str, pos, end_delim)
        pos = pos or 1
        if pos > #str then error('Reached unexpected end of input.') end
        local pos = pos + #str:match('^%s*', pos)  
        local first = str:sub(pos, pos)
        if first == '{' then  
          local obj, key, delim_found = {}, true, true
          pos = pos + 1
          while true do
            key, pos = json.parse(str, pos, '}')
            if key == nil then return obj, pos end
            if not delim_found then error('Comma missing between object items.') end
            pos = skip_delim(str, pos, ':', true)  
            obj[key], pos = json.parse(str, pos)
            pos, delim_found = skip_delim(str, pos, ',')
          end
        elseif first == '[' then  
          local arr, val, delim_found = {}, true, true
          pos = pos + 1
          while true do
            val, pos = json.parse(str, pos, ']')
            if val == nil then return arr, pos end
            if not delim_found then error('Comma missing between array items.') end
            arr[#arr + 1] = val
            pos, delim_found = skip_delim(str, pos, ',')
          end
        elseif first == '"' then  
          return parse_str_val(str, pos + 1)
        elseif first == '-' or first:match('%d') then  
          return parse_num_val(str, pos)
        elseif first == end_delim then  
          return nil, pos + 1
        else  
          local literals = {['true'] = true, ['false'] = false, ['null'] = json.null}
          for lit_str, lit_val in pairs(literals) do
            local lit_end = pos + #lit_str - 1
            if str:sub(pos, lit_end) == lit_str then return lit_val, lit_end + 1 end
          end
          local pos_info_str = 'position ' .. pos .. ': ' .. str:sub(pos, pos + 10)
          error('Invalid json syntax starting at ' .. pos_info_str)
        end
      end
      return json
    end
    local json = j()
    `
  }

  async updateSystemOrigin() {
    const connection = this.getConnection()
    const res = await connection.execCommand('apt-get update')
    this.execLog += res.stdout || res.stderr
    return this.execLog
  }

  async installDepend() {
    const connection = this.getConnection()
    const res = await connection.execCommand('apt-get install screen libstdc++6 libgcc1 libcurl4-gnutls-dev libstdc++6:i386 libgcc1:i386 libcurl4-gnutls-dev:i386 -y')
    this.execLog = res.stdout.split('\n').reverse().join('\n') + this.execLog
    return this.execLog
  }

  async downloadSteamCMD() {
    const connection = this.getConnection()
    let res = await connection.execCommand('mkdir ~/steamcmd')
    this.execLog = res.stdout.split('\n').reverse().join('\n') + this.execLog
    res = await connection.execCommand('wget -P ~/steamcmd https://steamcdn-a.akamaihd.net/client/installer/steamcmd_linux.tar.gz')
    this.execLog = res.stdout.split('\n').reverse().join('\n') + this.execLog
    return this.execLog
  }

  async installSteamCMD() {
    const connection = this.getConnection()
    const res = await connection.execCommand('tar -xvzf ~/steamcmd/steamcmd_linux.tar.gz -C ~/steamcm')
    this.execLog = res.stdout.split('\n').reverse().join('\n') + this.execLog
    return this.execLog
  }

  async installServerClient() {
    const connection = this.getConnection()

    try {
      await connection.exec('bash ~/steamcmd/steamcmd.sh +force_install_dir ~/myDSTserver +login anonymous +app_update 343050 validate +quit', [], {
        onStdout: (chunk) => {
          this.execLog = chunk.toString('utf8').split('\n').reverse().join('\n') + this.execLog
          console.log(chunk.toString('utf8'))
        },
        onStderr: (chunk) => {
          this.execLog = chunk.toString('utf8').split('\n').reverse().join('\n') + this.execLog
          console.log(chunk.toString('utf8'))
        },
      })
    }
    catch {
      if (this.execLog && this.execLog.includes('fully installed'))
        return true
    }
    return false
  }

  currentServerInstallProgress() {

  }

  currentServerInstallLog() {
    return this.execLog
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
