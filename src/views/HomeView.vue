<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  console.log('onMounted')
  fetch('/api/customer')
    .then((res) => res.json())
    .then((data) => console.log(data))
    .catch((err) => console.error(err))

  // 测试创建一个客户然后删除
  fetch('/api/customer', {
    method: 'POST',
    body: JSON.stringify({ CompanyName: 'Test', ContactName: 'Test' }),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log('create customer success!', data)
      const customerId = data.results[0].CustomerId
      return fetch('/api/customer', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ CustomerId: customerId }),
      })
    })
    .then((res) => res.json())
    .then((data) => console.log('delete customer success!', data))
    .catch((err) => console.error(err))
})
</script>

<template>
  <main>
    <TheWelcome />
  </main>
</template>
