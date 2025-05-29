<template>
  <header class="app-header">
    <h1 class="title">Yuzuriha Chronicle</h1>
    <nav class="nav-links">
      <RouterLink v-for="item in navItems" :key="item.name" :to="item.path" class="nav-item" active-class="active-link">
        {{ item.name }}
      </RouterLink>
    </nav>
  </header>
</template>

<script setup lang="ts">
const navItems = [
  { name: '首页', path: '/' },
  { name: '人物设定', path: '/characters' },
  { name: '角色经历', path: '/world' },
  { name: '图集', path: '/gallery' },
  { name: '留言板', path: '/about' },
  { name: '与祈对话', path: '/yeqiChat' },
  { name: '抽奖', path: '/luckDraw' }
]
</script>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: 64px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 40px;
  background: rgba(30, 0, 60, 0.65);
  backdrop-filter: blur(16px);
  box-shadow: 0 2px 20px rgba(255, 0, 255, 0.3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  animation: fadeInDown 0.8s ease-out both;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.title {
  font-size: 26px;
  font-weight: bold;
  color: #fff;
  background: linear-gradient(to right, #ff79c6, #bd93f9);
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 10px rgba(255, 121, 198, 0.4);
  transition: transform 0.3s ease;
}

.title:hover {
  transform: scale(1.05);
}

.nav-links {
  display: flex;
  gap: 24px;
}

.nav-item {
  position: relative;
  color: #e0e0e0;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.3s ease;
}

.nav-item::after {
  content: "";
  position: absolute;
  left: 50%;
  bottom: -4px;
  width: 0;
  height: 2px;
  background: #ff79c6;
  transition: all 0.3s ease;
  transform: translateX(-50%);
  opacity: 0.6;
}

.nav-item:hover {
  color: #ffb6e6;
  text-shadow: 0 0 6px #ff79c6;
}

.nav-item:hover::after {
  width: 100%;
  opacity: 1;
}

.active-link {
  color: #ff79c6;
  font-weight: 600;
}

.active-link::after {
  width: 100%;
  opacity: 1;
}

/* 响应式：小屏折叠导航 */
@media (max-width: 768px) {
  .app-header {
    padding: 0 20px;
  }

  .nav-links {
    display: none;
  }
}
</style>
