import { request } from '@/utils/request'

export interface Customer {
  CustomerId: number
  CompanyName: string
  ContactName: string
}

export const customer = {
  // 获取客户列表
  getList(): Promise<Customer[]> {
    return request.get('/customer/list')
  },

  // 创建客户
  create(data: Omit<Customer, 'CustomerId'>): Promise<Customer> {
    return request.post('/customer', data)
  },

  // 删除客户
  delete(id: number): Promise<void> {
    return request.delete(`/customer/${id}`)
  },

  // 更新客户
  update(data: Customer): Promise<Customer> {
    return request.put('/customer', data)
  },
}
