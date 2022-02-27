import type { Config, NodeSSH as NodeSSHType } from 'node-ssh'
import { ipcMain } from 'electron'
import type { AssignmentStatement, BinaryExpression, BooleanLiteral, Chunk, ForNumericStatement, Identifier, IndexExpression, LocalStatement, LogicalExpression, MemberExpression, Node, NumericLiteral, ReturnStatement, StringLiteral, TableConstructorExpression, TableKey, TableKeyString, TableValue, UnaryExpression } from 'luaparse'
import { fromPairs, get, isEmpty, map, set } from 'lodash'

const { NodeSSH } = require('node-ssh')
const fengari = require('fengari-web')

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
}

export class Lua2json {
  variables: any
  path: string| null = null
  constructor(variable: any, path: string) {
    this.variables = variable
    this.path = path
  }

  handleAst(ast: Node): any {
    switch (ast.type) {
      case 'Chunk': return this.handleChunk(ast)
      case 'LogicalExpression': return this.handleLogicalExpression(ast)
      case 'IndexExpression': return this.handleIndexExpression(ast)
      case 'Identifier': return this.handleIdentifier(ast)
      case 'NilLiteral': return this.handleNilLiteral()
      case 'BooleanLiteral': return this.handleBooleanLiteral(ast)
      case 'NumericLiteral':return this.handleNumericLiteral(ast)
      case 'StringLiteral': return this.handleStringLiteral(ast)
      case 'UnaryExpression' : return this.handleUnaryExpression(ast)
      case 'TableKey':
      case 'TableKeyString': return this.handleTableKey(ast)
      case 'TableValue': return this.handleTableValue(ast)
      case 'TableConstructorExpression': return this.handleTableConstructorExpression(ast)
      case 'LocalStatement': return this.handleLocalStatement(ast)
      case 'ReturnStatement': return this.handleReturnStatement(ast)
      case 'BinaryExpression':return this.handleBinaryExpression(ast)
      case 'AssignmentStatement': return this.handleAssignmentStatement(ast)
      case 'ForNumericStatement': return this.handleForNumericStatement(ast)
      case 'MemberExpression': return this.handleMemberExpression(ast)
      default:
        console.log(`can't parse ${ast.type} from ${this.path}`)
        return `can't parse ${ast.type} from ${this.path}`
    }
  }

  handleMemberExpression(ast: MemberExpression): any {
    if (ast.indexer === '.')
      return get(get(this.variables, this.handleAst(ast.base)), this.handleAst(ast.identifier))
  }

  handleIndexExpression(ast: IndexExpression): any {
    return `${this.handleAst(ast.base)}[${this.variables[this.handleAst(ast.index)]}]`
  }

  handleForNumericStatement(ast: ForNumericStatement): any {
    const start = this.handleAst(ast.start) - 1
    const end = this.handleAst(ast.end).length
    const step = ast.step ? this.handleAst(ast.step) : 1
    for (let i = start; i < end; i += step) {
      this.variables[this.handleAst(ast.variable)] = i
      ast.body.forEach(ast => this.handleAst(ast))
    }
    delete this.variables[this.handleAst(ast.variable)]
  }

  handleAssignmentStatement(ast: AssignmentStatement): any {
    const temp: any[] = []
    for (let i = 0; i < ast.variables.length; ++i) {
      const variable = ast.variables[i]
      if (variable.type === 'Identifier')
        this.variables[variable.name] = this.handleAst(ast.init[i])
      else if (variable.type === 'IndexExpression')
        set(this.variables, this.handleAst(variable), this.handleAst(ast.init[i]))
    }
    return temp
  }

  handleBinaryExpression(ast: BinaryExpression): any {
    let left = this.handleAst(ast.left)
    let right = this.handleAst(ast.right)
    if (ast.left.type === 'Identifier')
      left = this.variables[left]
    if (ast.right.type === 'Identifier')
      right = this.variables[right]

    switch (ast.operator) {
      case '+' : return left + right
      case '-' : return left - right
      case '*' : return left * right
      case '%' : return left % right
      case '/' : return left / right
      case '^' : return left ^ right
      case '&' : return left & right
      case '|' : return left | right
      case '<<' : return left << right
      case '>>' : return left >> right
      case '~=' : return left !== right
      case '==' : return left === right
      case '<' : return left < right
      case '<=' : return left <= right
      case '>' : return left > right
      case '>=' : return left >= right
      default: return `can't parse ${ast.operator} from ${this.path}`
    }
  }

  handleLogicalExpression(ast: LogicalExpression): any {
    const left = this.handleAst(ast.left)
    const right = this.handleAst(ast.right)
    return ast.operator === 'or' ? left || right : left && right
  }

  handleReturnStatement(ast: ReturnStatement): any {
    const values = ast.arguments.map(this.handleAst)
    return values.length === 1 ? values[0] : values
  }

  handleLocalStatement(ast: LocalStatement): any {
    const values = ast.init.map(ast => this.handleAst(ast))
    ast.variables.forEach((ast, idx) => {
      const name = this.handleAst(ast)
      this.variables[name] = values[idx]
    })
  }

  handleTableConstructorExpression(ast: TableConstructorExpression): any {
    // TableKey || TableKeyString
    if (ast.fields[0] && (ast.fields[0] as TableKey | TableKeyString).key) {
      const object = fromPairs(
        map(ast.fields, (field) => {
          const { key, value } = this.handleAst(field)
          return [key, value]
        }),
      )
      return isEmpty(object) ? [] : object
    }
    // TableValue
    return map(ast.fields, (field) => {
      const value = this.handleAst(field)
      return value.__internal_table_key ? [value.key, value.value] : value
    })
  }

  handleTableValue(ast: TableValue): any {
    return this.handleAst(ast.value)
  }

  handleTableKey(ast: TableKey | TableKeyString): any {
    const value = this.handleAst(ast.value)
    return { key: this.handleAst(ast.key), value: this.variables[value] || value }
  }

  handleUnaryExpression(ast: UnaryExpression): any {
    if (ast.operator === '-')
      return -this.handleAst(ast.argument)

    else if (ast.operator === '#')
      return this.variables[this.handleAst(ast.argument)]

    else
      return `can't parse ${ast.operator} from ${this.path}`
  }

  handleChunk(ast: Chunk): any {
    return ast.body.forEach(ast => this.handleAst(ast))
  }

  handleIdentifier(ast: Identifier): any {
    return ast.name
  }

  handleNilLiteral(): null {
    return null
  }

  handleBooleanLiteral(ast: BooleanLiteral): boolean {
    return ast.value
  }

  handleNumericLiteral(ast: NumericLiteral): number {
    return ast.value
  }

  handleStringLiteral(ast: StringLiteral): string {
    const result = (ast.value || ast.raw)
    return result.replace(/\"/g, '').trim()
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
