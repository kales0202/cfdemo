import { AutoRouter, IRequest } from 'itty-router'
import { createResponse, createErrorResponse } from '../utils/response'
import { Env } from '../types/worker-configuration'

const router = AutoRouter({ base: '/api/customer' })

// 获取客户列表
router.get<IRequest>('/list', async (request, env: Env) => {
  try {
    console.log('request customer list')
    const customers = await env.DB.prepare('SELECT * FROM Customers').all()
    return createResponse(customers.results)
  } catch (error) {
    return createErrorResponse(error)
  }
})

// 获取客户
router.get<IRequest>('/:id', async (request, env: Env) => {
  const { id } = request.params
  const customer = await env.DB.prepare('SELECT * FROM Customers WHERE CustomerId = ?').bind(id).first()
  return createResponse(customer)
})

// 创建客户
router.post<IRequest>('', async (request, env: Env) => {
  try {
    const { CompanyName, ContactName } = await request.json()
    const customers = await env.DB.prepare(
      'INSERT INTO Customers (CompanyName, ContactName) VALUES (?, ?) RETURNING *',
    )
      .bind(CompanyName, ContactName)
      .run()
    return createResponse(customers.results[0])
  } catch (error) {
    return createErrorResponse(error)
  }
})

// 更新客户
router.put('', async (request: Request, env: Env) => {
  try {
    const { CustomerId, CompanyName, ContactName } = await request.json()
    const customers = await env.DB.prepare(
      'UPDATE Customers SET CompanyName = ?, ContactName = ? WHERE CustomerId = ? RETURNING *',
    )
      .bind(CompanyName, ContactName, CustomerId)
      .run()
    return createResponse(customers.results[0])
  } catch (error) {
    return createErrorResponse(error)
  }
})

// 删除客户
router.delete<IRequest>('/:id', async (request, env: Env) => {
  try {
    const { id } = request.params
    if (!id) {
      return createResponse(null, 'CustomerId is required', 400, 400)
    }
    await env.DB.prepare('DELETE FROM Customers WHERE CustomerId = ?').bind(id).run()
    return createResponse()
  } catch (error) {
    return createErrorResponse(error, 'delete customer error')
  }
})

export default { ...router } // this looks pointless, but trust us
