import { Env } from '../types/worker-configuration'

export const Utils = {
  // 将字节数转换为人类可读的文件大小
  humanReadableSize(size: number) {
    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    let unitIndex = 0
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    return `${size.toFixed(2)} ${units[unitIndex]}`
  },
  // function日志统一打印规范
  // 格式: 2024-12-20T15:00:00.000Z [requestId] [location] [functionPath][method] msg
  _log(msg: string, env: Env, func: (msg: string) => void) {
    const timestamp = new Date().toISOString()
    func(
      `${timestamp} [${env.requestId}] [${env.location}] [${env.functionPath}][${env.method}] ${msg}`,
    )
  },
  log(msg: string, env: Env) {
    this._log(msg, env, console.log)
  },
  warn(msg: string, env: Env) {
    this._log(msg, env, console.warn)
  },
  error(msg: string, env: Env) {
    this._log(msg, env, console.error)
  },
}
