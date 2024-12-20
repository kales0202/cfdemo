import { AutoRouter, IRequest } from 'itty-router'
import { createResponse, createErrorResponse } from '../utils/response'
import { Env } from '../types/worker-configuration'
import { ReadableStream } from '@cloudflare/workers-types/experimental'
import { R2UploadedPart } from '@cloudflare/workers-types/experimental'
import { Utils } from '../utils'

const CHUNK_SIZE = 10 * 1024 * 1024 // 10MB 分片

const router = AutoRouter({ base: '/api/storage' })

// 列出所有文件
router.get<IRequest>('/files', async (request, env: Env) => {
  Utils.log('list files', env)
  try {
    const list = await env.MY_BUCKET.list()
    const files = list.objects.map((obj) => ({
      name: obj.key,
      size: obj.size,
      uploaded: obj.uploaded,
      etag: obj.etag,
    }))
    return createResponse(files)
  } catch (error) {
    return createErrorResponse(error)
  }
})

// 获取文件
router.get<IRequest>('/:name.:extension?', async (request, env: Env) => {
  try {
    const { name, extension } = request.params
    const fullname = `${name}.${extension}`
    Utils.log(`get file: ${fullname}`, env)
    const object = await env.MY_BUCKET.get(fullname)

    if (!object) {
      return createResponse(null, 'File not found', 404, 404)
    }

    // 直接返回流
    return new Response(object.body as unknown as BodyInit, {
      headers: {
        'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${fullname}"`,
        'Content-Length': object.size.toString(),
        'Accept-Ranges': 'bytes',
        etag: object.httpEtag,
      },
    })
  } catch (error) {
    return createErrorResponse(error)
  }
})

/**
 * 文件上传处
 * 支持两种模式：
 * 1. 小文件（<= X MB）：直接上传
 * 2. 大文件（> X MB）：自动分片上传，每片 X MB
 *
 * @param request 包含文件内容的请求
 * @param env 包含R2存储桶的环境变量
 * @returns 上传成功返回success，失败返回错误信息
 */
router.put<IRequest>('/:name.:extension?', async (request, env: Env) => {
  try {
    const { name, extension } = request.params
    const fullname = `${name}.${extension}`
    const contentLength = parseInt(request.headers.get('content-length') || '0')
    const contentType = request.headers.get('content-type') || 'application/octet-stream'

    Utils.log(`upload file: ${fullname}, size: ${Utils.humanReadableSize(contentLength)}`, env)

    if (!request.body) {
      throw new Error('Request body is required')
    }

    // 小文件直接上传
    if (contentLength > 0 && contentLength <= CHUNK_SIZE) {
      await env.MY_BUCKET.put(fullname, request.body as unknown as ReadableStream, {
        httpMetadata: { contentType },
        customMetadata: { uploadedAt: new Date().toISOString() },
      })
      return createResponse(null, 'success')
    }

    // 创建��片上传任务
    const multipartUpload = await env.MY_BUCKET.createMultipartUpload(fullname, {
      httpMetadata: { contentType },
      customMetadata: { uploadedAt: new Date().toISOString() },
    })

    try {
      const reader = request.body.getReader()
      const uploadedParts: R2UploadedPart[] = []
      const chunks: Uint8Array[] = [] // 使用数组存储数据块
      let totalLength = 0
      let partNumber = 1
      while (true) {
        const { done, value } = await reader.read()
        if (value) {
          chunks.push(value)
          totalLength += value.length
        }
        // 当累积长度达到或超过分片大小，或者是最后一块数据时，执行上传
        while (totalLength >= CHUNK_SIZE || (done && totalLength > 0)) {
          // 确定这次要上传的大小（取CHUNK_SIZE和totalLength的较小值）
          const uploadSize = Math.min(CHUNK_SIZE, totalLength)
          const uploadChunk = new Uint8Array(uploadSize)
          let offset = 0

          while (offset < uploadSize) {
            const chunk = chunks[0]
            const remainingSpace = uploadSize - offset
            if (chunk.length <= remainingSpace) {
              uploadChunk.set(chunk, offset)
              offset += chunk.length
              totalLength -= chunk.length
              chunks.shift()
            } else {
              uploadChunk.set(chunk.subarray(0, remainingSpace), offset)
              chunks[0] = chunk.subarray(remainingSpace)
              totalLength -= remainingSpace
              break
            }
          }
          const uploadedPart = await multipartUpload.uploadPart(partNumber, uploadChunk)
          uploadedParts.push(uploadedPart)
          partNumber++
          Utils.log(
            `uploaded part: ${partNumber}, size: ${Utils.humanReadableSize(uploadChunk.length)}`,
            env,
          )
        }
        if (done) break
      }

      // 完成分片上传
      await multipartUpload.complete(uploadedParts)
      return createResponse(null, 'success')
    } catch (error) {
      // 出错时中止分片上传
      await multipartUpload.abort()
      throw error
    }
  } catch (error) {
    return createErrorResponse(error)
  }
})

// 删除文件
router.delete<IRequest>('/:name.:extension?', async (request, env: Env) => {
  try {
    const { name, extension } = request.params
    const fullname = `${name}.${extension}`
    Utils.log(`delete file: ${fullname}`, env)

    await env.MY_BUCKET.delete(fullname)

    return createResponse(null, 'success')
  } catch (error) {
    return createErrorResponse(error)
  }
})

export default { ...router } // this looks pointless, but trust us
