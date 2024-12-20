<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="app">
    <header>
      <h1>Cloudflare Pages Demo</h1>
      <p>基于 Cloudflare Pages + D1 + R2 的全栈应用演示</p>
    </header>
    <main>
      <RouterView />
    </main>
    <footer>
      <p>
        Powered by Cloudflare Pages + D1 + R2 |
        <a href="https://github.com/your-repo" target="_blank">GitHub</a>
      </p>
    </footer>
  </div>
</template>

<style>
/* Reset */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* Global styles */
:root {
  --primary-color: #3eaf7c;
  --text-color: #4a4a4a;
  --border-color: #e5e5e5;
  --background-color: #f5f5f5;
  --success-color: #42b983;
  --danger-color: #ff7875;
  --cancel-color: #909399;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell,
    'Open Sans', 'Helvetica Neue', sans-serif;
  line-height: 1.6;
  color: var(--text-color);
  background-color: var(--background-color);
}

/* Layout */
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

header {
  background: white;
  padding: 2rem 0;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

header h1 {
  color: var(--primary-color);
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

header p {
  color: var(--text-color);
  opacity: 0.8;
}

main {
  flex: 1;
  width: 80%;
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
}

footer {
  background: white;
  padding: 1.5rem 0;
  text-align: center;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
}

footer a {
  color: var(--primary-color);
  text-decoration: none;
}

footer a:hover {
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 768px) {
  main {
    width: 95%;
    margin: 1rem auto;
  }

  header h1 {
    font-size: 1.5rem;
  }
}
</style>
