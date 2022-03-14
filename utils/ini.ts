export type IniConfig = Record<string, Record<string, string|boolean|number>>

export default {
  parse: (data: string): IniConfig => {
    const REGEX_SECTION = /^\s*\[\s*([^\]]*)\s*\]\s*$/
    const REGEX_PARAM = /^\s*([\w\.\-\_]+)\s*=\s*(.*?)\s*$/
    const REGEX_COMMENT = /^\s*;.*$/
    const value: Record<string, any> = {}
    const lines = data.split(/\r?\n/)
    let section = null
    for (const line of lines) {
      if (REGEX_SECTION.test(line)) {
        section = line.replace(REGEX_SECTION, '$1')
        if (!(section in value))
          value[section] = {}
        continue
      }
      if (REGEX_COMMENT.test(line) || line === '')
        continue

      if (REGEX_PARAM.test(line)) {
        const [, key, val] = line.match(REGEX_PARAM) as RegExpMatchArray
        if (section) value[section][key] = val
      }
    }
    return value
  },
  stringify: (data: IniConfig): string => {
    const result = []
    for (const section in data) {
      result.push(`[${section}]`)
      for (const key in data[section])
        result.push(`${key}=${data[section][key]}`)
    }
    return result.join('\n')
  },
}
