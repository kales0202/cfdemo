<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { storage, type StorageFile } from '@/api/storage'
import { customer, type Customer } from '@/api/customer'
import CustomerDialog from '@/components/CustomerDialog.vue'
import MessageBox from '@/components/MessageBox.vue'
import LoadingMask from '@/components/LoadingMask.vue'

// R2 存储相关
const fileList = ref<StorageFile[]>([])
const isUploading = ref(false)
const uploadProgress = ref(0)

// D1 数据库相关
const customers = ref<Customer[]>([])
const pageLoading = ref(false)
const sectionLoading = ref(false)
const newCustomer = ref<Omit<Customer, 'CustomerId'>>({
  CompanyName: '',
  ContactName: '',
})
const showEditDialog = ref(false)
const currentCustomer = ref<Customer | null>(null)

// 消息提示引用
const messageBox = ref()

// R2 文件操作方法
const handleFileUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return

  const file = input.files[0]
  const fileName = file.name

  try {
    isUploading.value = true
    uploadProgress.value = 0
    await storage.uploadFile(fileName, file)
    await getFileList()
    input.value = '' // 清空输入框
    messageBox.value.success('文件上传成功')
  } catch (error) {
    console.error('Upload failed:', error)
    messageBox.value.error('文件上传失败')
  } finally {
    isUploading.value = false
    uploadProgress.value = 0
  }
}

const getFileList = async () => {
  try {
    const files = await storage.getFileList()
    fileList.value = files
  } catch (error) {
    console.error('Failed to get file list:', error)
    messageBox.value.error('获取文件列表失败')
  }
}

const downloadFile = async (fileName: string) => {
  try {
    const url = await storage.downloadFile(fileName)
    window.location.href = url
    messageBox.value.success('开始下载文件')
  } catch (error) {
    console.error('Download failed:', error)
    messageBox.value.error('文件下载失败')
  }
}

const deleteFile = async (fileName: string) => {
  if (!confirm(`确定要删除文件 "${fileName}" 吗？`)) return

  try {
    await storage.deleteFile(fileName)
    await getFileList()
    messageBox.value.success('文件删除成功')
  } catch (error) {
    console.error('Delete failed:', error)
    messageBox.value.error('文件删除失败')
  }
}

// D1 客户操作方法
const loadCustomers = async () => {
  try {
    sectionLoading.value = true
    customers.value = await customer.getList()
  } catch (error) {
    console.error('Failed to load customers:', error)
  } finally {
    sectionLoading.value = false
  }
}

const createCustomer = async () => {
  if (!newCustomer.value.CompanyName || !newCustomer.value.ContactName) {
    messageBox.value.error('请填写完整的客户信息')
    return
  }

  try {
    sectionLoading.value = true
    await customer.create(newCustomer.value)
    newCustomer.value = { CompanyName: '', ContactName: '' }
    await loadCustomers()
    messageBox.value.success('客户创建成功')
  } catch (error) {
    console.error('Failed to create customer:', error)
    messageBox.value.error('创建客户失败')
  } finally {
    sectionLoading.value = false
  }
}

const startEdit = (cust: Customer) => {
  currentCustomer.value = { ...cust }
  showEditDialog.value = true
}

const handleUpdate = async (formData: Omit<Customer, 'CustomerId'>) => {
  if (!currentCustomer.value) return

  try {
    pageLoading.value = true
    await customer.update({
      ...formData,
      CustomerId: currentCustomer.value.CustomerId,
    })
    currentCustomer.value = null
    await loadCustomers()
    messageBox.value.success('客户信息更新成功')
  } catch (error) {
    console.error('Failed to update customer:', error)
    messageBox.value.error('更新客户失败')
  } finally {
    pageLoading.value = false
  }
}

const deleteCustomer = async (id: number) => {
  if (!confirm('确定要删除此客户吗？此操作不可恢复')) return

  try {
    pageLoading.value = true
    await customer.delete(id)
    await loadCustomers()
    messageBox.value.success('客户删除成功')
  } catch (error) {
    console.error('Failed to delete customer:', error)
    messageBox.value.error('删除客户失败')
  } finally {
    pageLoading.value = false
  }
}

onMounted(async () => {
  try {
    pageLoading.value = true
    await Promise.all([getFileList(), loadCustomers()])
  } catch (error) {
    console.error('Failed to load initial data:', error)
    messageBox.value.error('数据加载失败')
  } finally {
    pageLoading.value = false
  }
})
</script>

<template>
  <div class="home">
    <MessageBox ref="messageBox" />
    <LoadingMask :loading="pageLoading" text="页面加载中..." />

    <!-- D1 数据库操作部分 -->
    <section class="card">
      <LoadingMask :loading="sectionLoading" />
      <div class="card-header">
        <h2>D1 数据库演示</h2>
        <p>基本的客户信息 CRUD 操作</p>
      </div>

      <div class="card-body">
        <!-- 新增客户表单 -->
        <div class="form-group">
          <input v-model="newCustomer.CompanyName" placeholder="公司名" :disabled="sectionLoading" />
          <input v-model="newCustomer.ContactName" placeholder="联系人" :disabled="sectionLoading" />
          <button class="btn primary" @click="createCustomer" :disabled="sectionLoading">
            {{ sectionLoading ? '处理中...' : '添加客户' }}
          </button>
        </div>

        <!-- 客户列表 -->
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>公司名称</th>
                <th>联系人</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="cust in customers" :key="cust.CustomerId">
                <td>{{ cust.CustomerId }}</td>
                <td>{{ cust.CompanyName }}</td>
                <td>{{ cust.ContactName }}</td>
                <td>
                  <button class="btn small primary" @click="startEdit(cust)">编辑</button>
                  <button class="btn small danger" @click="deleteCustomer(cust.CustomerId)">
                    删除
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- R2 存储操作部分 -->
    <section class="card">
      <LoadingMask :loading="isUploading" text="文件上传中..." />
      <div class="card-header">
        <h2>R2 存储演示</h2>
        <p>文件上传、下载和管理</p>
      </div>

      <div class="card-body">
        <!-- 文件上传 -->
        <div class="upload-area">
          <input type="file" @change="handleFileUpload" :disabled="isUploading" />
          <div v-if="isUploading" class="progress">
            <div class="progress-bar" :style="{ width: `${uploadProgress}%` }"></div>
            <span>{{ uploadProgress }}%</span>
          </div>
        </div>

        <!-- 文件列表 -->
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>文件名</th>
                <th>大小</th>
                <th>上传时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="file in fileList" :key="file.name">
                <td>{{ file.name }}</td>
                <td>{{ (file.size / 1024).toFixed(2) }} KB</td>
                <td>{{ new Date(file.uploaded).toLocaleString() }}</td>
                <td>
                  <button class="btn small primary" @click="downloadFile(file.name)">下载</button>
                  <button class="btn small danger" @click="deleteFile(file.name)">删除</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- 添加编辑弹窗 -->
    <CustomerDialog v-model="showEditDialog" :customer="currentCustomer" @submit="handleUpdate" />
  </div>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.card {
  position: relative;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-header {
  padding: 1.5rem;
  background: var(--primary-color);
  color: white;
}

.card-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.card-header p {
  margin: 0.5rem 0 0;
  opacity: 0.9;
}

.card-body {
  padding: 1.5rem;
}

/* Forms */
.form-group {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

input {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  flex: 1;
}

/* Buttons */
.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  margin-right: 0.5rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn.small {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.btn.primary {
  background: var(--primary-color);
  color: white;
}

.btn.success {
  background: var(--success-color);
  color: white;
}

.btn.cancel {
  background: var(--cancel-color);
  color: white;
}

.btn.danger {
  background: var(--danger-color);
  color: white;
}

/* Tables */
.table-wrapper {
  overflow-x: auto;
  margin-top: 1rem;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

th {
  font-weight: 600;
  background: #f9f9f9;
}

/* Upload area */
.upload-area {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.upload-area input[type='file'] {
  padding: 0.5rem;
  border: 2px dashed var(--border-color);
  border-radius: 4px;
  cursor: pointer;
}

.upload-area input[type='file']:hover {
  border-color: var(--primary-color);
}

.progress {
  margin-top: 0.5rem;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  height: 4px;
}

.progress-bar {
  height: 100%;
  background: var(--primary-color);
  transition: width 0.3s ease;
}

.progress span {
  position: absolute;
  top: 6px;
  right: 0;
  font-size: 0.875rem;
}

/* 修改表格中的按钮样式 */
td .btn {
  margin-right: 0.5rem;
  min-width: 60px;
}

td .btn:last-child {
  margin-right: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .form-group {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    margin-right: 0;
    margin-bottom: 0.5rem;
  }

  .btn:last-child {
    margin-bottom: 0;
  }

  td .btn {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    width: auto;
    margin-bottom: 0;
  }

  .card-header {
    padding: 1rem;
  }

  .card-body {
    padding: 1rem;
  }
}
</style>
