import { request } from '@/utils/request'
import type { AxiosResponse } from 'axios'

export interface StorageFile {
  name: string
  size: number
  uploaded: string
  etag: string
}

export const storage = {
  // 获取文件列表
  getFileList(): Promise<StorageFile[]> {
    return request.get('/storage/files')
  },

  // 获取文件内容
  // 获取文件限制：https://developers.cloudflare.com/workers/platform/limits/#response-limits
  getFile(fileName: string): Promise<AxiosResponse> {
    return request.get(`/storage/${fileName}`, {
      responseType: 'blob',
      transformResponse: [(data) => data],
      added: {
        skipResponseTransform: true,
      },
    })
  },

  // 上传文件
  // 上传文件限制：https://developers.cloudflare.com/workers/platform/limits/#request-limits
  uploadFile(fileName: string, file: File): Promise<void> {
    return request.put(`/storage/${fileName}`, file, {
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
      },
      transformResponse: [(data) => data],
      added: {
        skipResponseTransform: true,
      }
    })
  },

  // 删除文件
  deleteFile(fileName: string): Promise<void> {
    return request.delete(`/storage/${fileName}`)
  },
}
