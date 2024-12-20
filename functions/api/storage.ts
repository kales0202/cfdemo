import { AutoRouter, IRequest } from 'itty-router'
import { createResponse, createErrorResponse } from '../utils/response'
import { Env } from '../types/worker-configuration'

const router = AutoRouter({ base: '/api/storage' })

// 列出所有文件
router.get<IRequest>('/files', async (request, env: Env) => {
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
    console.log(`get file: ${fullname}`)
    const object = await env.MY_BUCKET.get(fullname)

    if (!object) {
      return createResponse(null, 'File not found', 404, 404)
    }

    // 直接返回流
    return new Response(object.body as unknown as BodyInit, {
      headers: {
        'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${fullname}"`,
        etag: object.httpEtag,
      },
    })
  } catch (error) {
    return createErrorResponse(error)
  }
})

// 上传文件
router.put<IRequest>('/:name.:extension?', async (request, env: Env) => {
  try {
    const { name, extension } = request.params
    const fullname = `${name}.${extension}`
    console.log(`upload file: ${fullname}`)

    await env.MY_BUCKET.put(fullname, request.body as unknown as ArrayBuffer, {
      customMetadata: {
        uploadedAt: new Date().toISOString(),
      },
    })

    return createResponse(null, 'success')
  } catch (error) {
    return createErrorResponse(error)
  }
})

// 删除文件
router.delete<IRequest>('/:name.:extension?', async (request, env: Env) => {
  try {
    const { name, extension } = request.params
    const fullname = `${name}.${extension}`
    console.log(`delete file: ${fullname}`)

    await env.MY_BUCKET.delete(fullname)

    return createResponse(null, 'success')
  } catch (error) {
    return createErrorResponse(error)
  }
})

export default { ...router } // this looks pointless, but trust us
