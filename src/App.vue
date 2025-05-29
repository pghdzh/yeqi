<template>
  <div id="app">
    <!-- 头部外层容器：负责捕捉 hover 事件 -->
    <div
      class="header-wrapper"
      @mouseenter="showHeader = true"
      @mouseleave="showHeader = false"
    >
      <!-- “热点区”：高度可调，用户把鼠标移到这里也能触发显示 -->
      <div class="hover-zone"></div>
      <!-- 真正的导航组件 -->
      <AppHeader v-show="showHeader" />
    </div>

    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'

const showHeader = ref(false)
</script>

<style scoped>
#app {
  position: relative;
  min-height: 100vh;
}

/* 头部外层容器，fixed 住它 */
.header-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  /* 隐藏时只有热点区高度，不占用太多空间 */
  z-index: 1000;
}

/* 点在这里也能触发显示，默认给个 20px 高度 */
.hover-zone {
  height: 20px;
  background: transparent;
}

/* AppHeader 本身在这里可做动画 */
.header-wrapper > .app-header {
  transition: transform 0.2s ease, opacity 0.2s ease;
  transform-origin: top;
}
/* v-show 切换时会自动加/去掉 display:none，不影响动画 */
.header-wrapper > .app-header[v-cloak] {
  display: none;
}


</style>
