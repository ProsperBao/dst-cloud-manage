import type { SSHOperateType } from '../../preload/expose-api/index'

export { }

declare global {
  interface Window {
    // Expose some Api through preload script
    fs: typeof import('fs')
    ssh: SSHOperateType
    ipcRenderer: import('electron').IpcRenderer
    removeLoading: () => void
  }
}
