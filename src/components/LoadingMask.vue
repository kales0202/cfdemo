<script setup lang="ts">
defineProps<{
  loading: boolean
  text?: string
}>()
</script>

<template>
  <Transition name="fade">
    <div v-if="loading" class="loading-mask">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <div class="loading-text">{{ text || '加载中...' }}</div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.loading-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.loading-content {
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 1rem;
  border: 3px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  color: var(--text-color);
  font-size: 0.875rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
