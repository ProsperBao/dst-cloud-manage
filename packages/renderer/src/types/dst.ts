export enum QuicklyInstallStep {
  UPDATE_PACKAGE = 'update_package', // 升级系统包安装工具
  INSTALL_DEPEND = 'install_depend', // 安装依赖
  DOWNLOAD_STEAM_CMD = 'download_steam_cmd', // 下载steamcmd
  INSTALL_STEAM_CMD = 'install_steam_cmd', // 安装steamcmd
  DOWNLOAD_DST_SERVER = 'download_dst_server', // 下载dst服务器
  INIT_MOD_CONFIG = 'init_mod_config', // 初始化模组配置专属存档
}
// 一键安装状态
export enum QuicklyInstallState {
  PENDING = 'info', // 处理中 ｜ info 是为了显示按钮状态
  SUCCESS = 'success', // 成功 ｜ success 是为了显示按钮状态
  FAIL = 'error', // 失败 ｜ error 是为了显示按钮状态
}
// 服务器存档配置类型
export enum ClusterOptionsType {
  SELECT, // 选择框
  INPUT, // 输入框
  SWITCH, // 开关
}
