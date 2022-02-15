export const store = {
  async get(key: string) {
    const { invoke } = window.ipcRenderer
    let value = await invoke('electron-store', 'get', key)
    try {
      value = JSON.parse(value)
    }
    catch (err) {
      console.log(err)
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
  async delete(key: string) {
    const { invoke } = window.ipcRenderer
    await invoke('electron-store', 'delete', key)
  },
}
