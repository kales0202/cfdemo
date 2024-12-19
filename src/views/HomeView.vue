<script setup lang="ts">
import { onMounted } from 'vue'
import request from '@/utils/request'

interface Customer {
  CustomerId: number
  CompanyName: string
  ContactName: string
}

onMounted(async () => {
  // 获取客户列表
  const customers: Customer[] = await request.get('/customer')
  console.log(customers)

  // 创建并删除客户测试
  const newCustomer: Customer = await request.post('/customer', {
    CompanyName: 'Test',
    ContactName: 'Test',
  })
  console.log('create customer success!', newCustomer)

  await request.delete('/customer', {
    data: { CustomerId: newCustomer.CustomerId },
  })
  console.log('delete customer success!')
})
</script>

<template>
  <main>
    <TheWelcome />
  </main>
</template>
