export const store = {
  async get(key: string) {
    const { invoke } = window.ipcRenderer
    let value = await invoke('electron-store', 'get', key)
    try {
      value = JSON.parse(value)
    }
    catch (e) {
      console.log(e)
    }
    return value
  },
  async set(key: string, value: any) {
    const { invoke } = window.ipcRenderer
    let val = value
    try {
      if (value && typeof value === 'object')
        val = JSON.stringify(value)
    }
    finally {
      await invoke('electron-store', 'set', key, val)
    }
  },
}
