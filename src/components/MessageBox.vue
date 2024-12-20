<script setup lang="ts">
import { ref } from 'vue'

interface Message {
  id: number
  type: 'success' | 'error' | 'info'
  content: string
}

const messages = ref<Message[]>([])
let messageId = 0

const show = (content: string, type: Message['type'] = 'info') => {
  const id = messageId++
  messages.value.push({ id, type, content })
  setTimeout(() => {
    messages.value = messages.value.filter(msg => msg.id !== id)
  }, 3000)
}

// 暴露方法给外部使用
defineExpose({
  success: (content: string) => show(content, 'success'),
  error: (content: string) => show(content, 'error'),
  info: (content: string) => show(content, 'info')
})
</script>

<template>
  <div class="message-container">
    <TransitionGroup name="message">
      <div
        v-for="msg in messages"
        :key="msg.id"
        class="message"
        :class="msg.type"
      >
        {{ msg.content }}
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.message-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

.message {
  padding: 10px 20px;
  border-radius: 4px;
  margin-bottom: 10px;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  text-align: center;
}

.success {
  background-color: var(--success-color);
}

.error {
  background-color: var(--danger-color);
}

.info {
  background-color: var(--primary-color);
}

/* 动画效果 */
.message-enter-active,
.message-leave-active {
  transition: all 0.3s ease;
}

.message-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.message-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
