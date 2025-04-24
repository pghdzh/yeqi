<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
</script>

<template>
  <div id="app">
    <AppHeader />

    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
#app {
  position: relative;
  min-height: 100vh;
 
}

.main-content {
  padding-top: 64px;
  /* 给导航栏预留高度空间 */
}
</style>
