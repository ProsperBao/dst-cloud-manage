import type { SSHOperateType } from '../../preload/ssh'

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
