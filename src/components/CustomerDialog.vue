<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Customer } from '@/api/customer'

const props = defineProps<{
  modelValue: boolean
  customer?: Customer | null
  title?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'submit': [customer: Omit<Customer, 'CustomerId'>]
}>()

const formData = ref<Omit<Customer, 'CustomerId'>>({
  CompanyName: '',
  ContactName: ''
})

// 监听customer变化,更新表单数据
watch(
  () => props.customer,
  (newVal) => {
    if (newVal) {
      formData.value = {
        CompanyName: newVal.CompanyName,
        ContactName: newVal.ContactName
      }
    } else {
      formData.value = {
        CompanyName: '',
        ContactName: ''
      }
    }
  }
)

const close = () => {
  emit('update:modelValue', false)
}

const submit = () => {
  if (!formData.value.CompanyName || !formData.value.ContactName) {
    alert('请填写完整信息')
    return
  }
  emit('submit', formData.value)
  close()
}
</script>

<template>
  <Teleport to="body">
    <div v-if="modelValue" class="dialog-overlay" @click="close">
      <div class="dialog" @click.stop>
        <div class="dialog-header">
          <h3>{{ title || '编辑客户' }}</h3>
          <button class="close-btn" @click="close">&times;</button>
        </div>
        <div class="dialog-body">
          <div class="form-group">
            <label>公司名称</label>
            <input v-model="formData.CompanyName" placeholder="请输入公司名称" />
          </div>
          <div class="form-group">
            <label>联系人</label>
            <input v-model="formData.ContactName" placeholder="请输入联系人" />
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn cancel" @click="close">取消</button>
          <button class="btn primary" @click="submit">确定</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

.dialog-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dialog-header h3 {
  margin: 0;
  color: var(--text-color);
  font-size: 1.25rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-color);
  opacity: 0.5;
  transition: opacity 0.2s;
}

.close-btn:hover {
  opacity: 1;
}

.dialog-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group:last-child {
  margin-bottom: 0;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-color);
  font-weight: 500;
}

input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  transition: border-color 0.2s;
}

input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.dialog-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn.primary {
  background: var(--primary-color);
  color: white;
}

.btn.cancel {
  background: var(--cancel-color);
  color: white;
}
</style>
