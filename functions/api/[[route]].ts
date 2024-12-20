import { AutoRouter } from 'itty-router'
import customer from './customer'
import storage from './storage'

const router = AutoRouter()

// 构建子路由
router.all('/api/customer/*', customer.fetch)
router.all('/api/storage/*', storage.fetch)
// 404
router.all('/api/*', () => new Response('Not Found.', { status: 404 }))

export const onRequest = async (context) => {
  try {
    // console.log('context', context)
    context.env.requestId = crypto.randomUUID() // 生成本次请求唯一ID
    context.env.method = context.request.method
    context.env.functionPath = context.functionPath
    context.env.location = `${context.request?.cf?.city}-${context.request?.cf?.country}`
    return router.fetch(context.request, context.env)
  } catch (error) {
    console.error('Error in onRequest:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
