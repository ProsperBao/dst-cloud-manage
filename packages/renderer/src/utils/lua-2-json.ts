import type { AssignmentStatement, BinaryExpression, BooleanLiteral, Chunk, ForNumericStatement, Identifier, IndexExpression, LocalStatement, LogicalExpression, Node, NumericLiteral, ReturnStatement, StringLiteral, TableConstructorExpression, TableKey, TableKeyString, TableValue, UnaryExpression } from 'luaparse'
import { fromPairs, isEmpty, map } from 'lodash'

export class Lua2json {
  variables: any
  constructor(variable: any) {
    this.variables = variable
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
      default:
        console.log(`can't parse ${ast.type}`)
        return `can't parse ${ast.type}`
    }
  }

  handleIndexExpression(ast: IndexExpression): any {
    return [this.handleAst(ast.base), this.handleAst(ast.index)]
  }

  handleForNumericStatement(ast: ForNumericStatement): any {
    const start = this.handleAst(ast.start) - 1
    const end = this.handleAst(ast.end).length + 1
    const step = ast.step ? this.handleAst(ast.step) : 1
    for (let i = start; i < end; i += step) {
      this.variables[this.handleAst(ast.variable)] = i
      ast.body.forEach(ast => this.handleAst(ast))
    }
  }

  handleAssignmentStatement(ast: AssignmentStatement): any {
    const temp: any[] = []
    for (let i = 0; i < ast.variables.length; ++i) {
      const variable = ast.variables[i]
      if (variable.type === 'Identifier') {
        this.variables[variable.name] = this.handleAst(ast.init[i])
      }
      else if (variable.type === 'IndexExpression') {
        const [base, index] = this.handleAst(variable)
        console.log(base, index)
        this.variables[base][this.variables[index]] = this.handleAst(ast.init[i])
      }
      // else if (variable.type === 'MemberExpression') {
      //   temp[variable.name] = this.handleAst(ast.init[i])
      // }
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
      default: return `can't parse ${ast.operator}`
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
    return { key: this.handleAst(ast.key), value: this.handleAst(ast.value) }
  }

  handleUnaryExpression(ast: UnaryExpression): any {
    if (ast.operator === '-')
      return -this.handleAst(ast.argument)

    else if (ast.operator === '#')
      return this.variables[this.handleAst(ast.argument)]

    else
      return `can't parse ${ast.operator}`
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
    return (ast.value || ast.raw).replace(/\"/g, '').replace(/\ /g, '')
  }
}
