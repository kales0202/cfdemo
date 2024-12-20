<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { storage, type StorageFile } from '@/api/storage'
import { customer } from '@/api/customer'

const fileList = ref<StorageFile[]>([])
const isUploading = ref(false)

// 文件上传示例
const handleFileUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return

  const file = input.files[0]
  const fileName = file.name

  try {
    isUploading.value = true

    // 如果文件大于 100MB，使用流式上传
    if (file.size > 100 * 1024 * 1024) {
      await storage.uploadFileStream(fileName, file)
    } else {
      await storage.uploadFile(fileName, file)
    }

    await getFileList()
  } catch (error) {
    console.error('Upload failed:', error)
    // 处理错误...
  } finally {
    isUploading.value = false
  }
}

// 获取文件列表
const getFileList = async () => {
  try {
    const files = await storage.getFileList()
    fileList.value = files
    console.log('Files:', files)
  } catch (error) {
    console.error('Failed to get file list:', error)
  }
}

// 下载文件
const downloadFile = async (fileName: string) => {
  try {
    const response = await storage.getFile(fileName)
    const disposition = response.headers['content-disposition']
    const filename = disposition ? disposition.split('filename=')[1].replace(/"/g, '') : fileName

    const url = window.URL.createObjectURL(response.data)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Download failed:', error)
  }
}

// 删除文件
const deleteFile = async (fileName: string) => {
  try {
    await storage.deleteFile(fileName)
    console.log('File deleted successfully!')
    // 刷新文件列表
    await getFileList()
  } catch (error) {
    console.error('Delete failed:', error)
  }
}

onMounted(async () => {
  // 获取文件列表
  await getFileList()

  // 客户相关代码
  const customers = await customer.getList()
  console.log(customers)

  const newCustomer = await customer.create({
    CompanyName: 'Test',
    ContactName: 'Test',
  })
  console.log('create customer success!', newCustomer)

  await customer.delete(newCustomer.CustomerId)
  console.log('delete customer success!')
})
</script>

<template>
  <main>
    <div class="storage-demo">
      <h2>Storage Demo</h2>

      <!-- 文件上传 -->
      <div class="upload-section">
        <input type="file" @change="handleFileUpload" />
      </div>

      <!-- 文件列表 -->
      <div class="file-list">
        <h3>Files:</h3>
        <ul>
          <li v-for="file in fileList" :key="file.name">
            {{ file.name }} ({{ (file.size / 1024).toFixed(2) }} KB)
            <button @click="downloadFile(file.name)">Download</button>
            <button @click="deleteFile(file.name)">Delete</button>
          </li>
        </ul>
      </div>
    </div>
  </main>
</template>

<style scoped>
.storage-demo {
  padding: 20px;
}

.upload-section {
  margin: 20px 0;
}

.file-list {
  margin-top: 20px;
}

.file-list ul {
  list-style: none;
  padding: 0;
}

.file-list li {
  margin: 10px 0;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

button {
  margin-left: 10px;
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  background-color: #4caf50;
  color: white;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}

button:last-child {
  background-color: #f44336;
}

button:last-child:hover {
  background-color: #da190b;
}
</style>
