<template>
  <header class="app-header">
    <h1 class="title">楪祈电子设定集</h1>
    <!-- 在线人数展示 -->
    <div class="online-count" v-if="onlineCount !== null">
      当前在线：<span class="count">{{ onlineCount }}人</span>
    </div>
    <!-- 移动端汉堡按钮 -->
    <button class="hamburger" @click="toggleMobileNav" aria-label="Toggle navigation">
      <span :class="{ open: mobileNavOpen }"></span>
      <span :class="{ open: mobileNavOpen }"></span>
      <span :class="{ open: mobileNavOpen }"></span>
    </button>

    <!-- 普通导航 & 移动端下拉导航 -->
    <nav :class="['nav-links', { 'mobile-open': mobileNavOpen }]">
      <RouterLink v-for="item in navItems" :key="item.name" :to="item.path" class="nav-item" active-class="active-link"
        @click="mobileNavOpen = false">
        {{ item.name }}
      </RouterLink>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { io } from 'socket.io-client'

const navItems = [
  { name: '首页', path: '/' },
  { name: '人物设定', path: '/characters' },
  { name: '角色经历', path: '/world' },
  { name: '图集', path: '/gallery' },
  { name: '留言板', path: '/about' },
  { name: '与祈对话', path: '/yeqiChat' },
  { name: '与集对话', path: '/jiChat' },
  { name: '剧情演绎', path: '/storyChat' },
  { name: 'wiki', path: '/wiki' },
  { name: '网盘资源', path: '/resources' },
]

const mobileNavOpen = ref(false)
function toggleMobileNav() {
  mobileNavOpen.value = !mobileNavOpen.value
}


const siteId = 'yeqi'

const onlineCount = ref<number | null>(null)

// 连接时带上 query.siteId
const socket: Socket = io('http://1.94.189.79:3000', {
  query: { siteId }
})

onMounted(() => {
  socket.on('onlineCount', (count: number) => {
    onlineCount.value = count
  })
})

onBeforeUnmount(() => {
  socket.disconnect()
})
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

/* 标题部分保持不变 */
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

.online-count {
  position: relative;
  margin-left: 16px;
  padding: 6px 14px;
  font-family: 'Cinzel Decorative', serif;
  font-size: 1rem;
  color: #ffe6fa;
  background: linear-gradient(135deg, rgba(189, 147, 249, 0.2), rgba(255, 121, 198, 0.2));
  border: 1px solid rgba(189, 147, 249, 0.5);
  border-radius: 24px;
  backdrop-filter: blur(6px);
  box-shadow:
    0 0 8px rgba(189, 147, 249, 0.3),
    inset 0 0 4px rgba(255, 121, 198, 0.4);
  overflow: hidden;
  cursor: default;
  transition: transform 0.3s ease;

  &::before {
    content: '';
    position: absolute;
    bottom: -2px;
    left: -50%;
    width: 200%;
    height: 2px;
    background: linear-gradient(90deg, transparent, #bd93f9, transparent);

  }

  &:hover {
    transform: scale(1.08);
  }

  .count {
    display: inline-block;
    margin-left: 4px;
    font-weight: 700;
    color: #bd93f9;
    text-shadow:
      0 0 4px rgba(189, 147, 249, 0.6),
      0 0 8px rgba(255, 121, 198, 0.4);
    background: linear-gradient(to right, #ff79c6, #bd93f9);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;

  }
}


/* 默认导航样式 */
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

/* 汉堡按钮 */
.hamburger {
  display: none;
  /* 默认隐藏 */
  flex-direction: column;
  justify-content: space-around;
  width: 28px;
  height: 24px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.hamburger span {
  display: block;
  width: 100%;
  height: 3px;
  background: #e0e0e0;
  border-radius: 2px;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.hamburger span.open:nth-child(1) {
  transform: translateY(10px) rotate(45deg);
}

.hamburger span.open:nth-child(2) {
  opacity: 0;
}

.hamburger span.open:nth-child(3) {
  transform: translateY(-10px) rotate(-45deg);
}

/* 响应式：小屏折叠导航 */
@media (max-width: 768px) {
  .app-header {
    padding: 0 20px;
  }

  .title {
    display: none;
  }

  /* 显示汉堡按钮 */
  .hamburger {
    display: flex;
  }

  /* 默认隐藏主导航 */
  .nav-links {
    position: absolute;
    top: 64px;
    left: 0;
    right: 0;
    flex-direction: column;
    background: rgba(30, 0, 60, 0.9);
    backdrop-filter: blur(12px);
    gap: 0;
    overflow: hidden;
    max-height: 0;
    transition: max-height 0.3s ease;
  }

  /* 打开时展开 */
  .nav-links.mobile-open {
    max-height: 500px;
    /* 足够容纳所有菜单项 */
  }

  .nav-links .nav-item {
    padding: 12px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
}
</style>
