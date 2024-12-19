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
    return router.fetch(context.request, context.env)
  } catch (error) {
    console.error('Error in onRequest:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
