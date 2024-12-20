import { request } from '@/utils/request'

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
  getFile(fileName: string): Promise<Blob> {
    return request.get(`/storage/${fileName}`, {
      responseType: 'blob',
      transformResponse: [(data) => data],
      added: {
        skipResponseTransform: true,
      },
    })
  },

  // 上传文件
  uploadFile(fileName: string, file: File): Promise<void> {
    return request.put(`/storage/${fileName}`, file)
  },

  // 删除文件
  deleteFile(fileName: string): Promise<void> {
    return request.delete(`/storage/${fileName}`)
  },
}
