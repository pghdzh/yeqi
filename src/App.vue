<template>
  <div id="app">
    <transition name="fade" v-if="showIntro">
      <div class="intro" @click="showIntro = false">
        <img :src="bgImage" alt="Kurumi" class="intro-bg" />
        <div class="intro-text">
          <span v-for="(char, index) in welcomeText" :key="index" class="intro-char"
            :style="{ animationDelay: `${index * 0.1}s` }">
            {{ char }}
          </span>
        </div>
      </div>
    </transition>
    <div v-else>
      <!-- 头部外层容器：负责捕捉 hover 事件 -->
      <div class="header-wrapper" @mouseenter="showHeader = true" @mouseleave="showHeader = false">
        <!-- “热点区”：高度可调，用户把鼠标移到这里也能触发显示 -->
        <div class="hover-zone"></div>
        <!-- 真正的导航组件 -->
        <AppHeader v-show="showHeader" />
      </div>

      <main class="main-content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { RouterView } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'

// 欢迎语句数组
const welcomePhrases = [
  '欢迎来到罪恶王冠的世界',
  '欢迎踏入楪祈的梦境',
  '与你的王之能力同步中...',
  '命运的序章，即将奏响',
  '加载中：楪祈的记忆碎片',
  '正在连接：葬仪社通讯频道',
  '你的灵魂，与我的歌共鸣了'
]

const randomText = () => {
  const index = Math.floor(Math.random() * welcomePhrases.length)
  return welcomePhrases[index].split('')
}

const welcomeText = ref<string[]>([])
const showIntro = ref(true)
const bgImage = ref('')

// 导入图片
const pcImages = Object.values(import.meta.glob('@/assets/images1/*.{jpg,png,jpeg,webp}', { eager: true, import: 'default' }))
const mobileImages = Object.values(import.meta.glob('@/assets/images2/*.{jpg,png,jpeg,webp}', { eager: true, import: 'default' }))

onMounted(() => {
  const isMobile = window.innerWidth <= 768
  const imageList = isMobile ? mobileImages : pcImages
  const randomIndex = Math.floor(Math.random() * imageList.length)
  bgImage.value = imageList[randomIndex]
  welcomeText.value = randomText()

  setTimeout(() => {
    showIntro.value = false
  }, 3000)
})
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
  height: 60px;
  background: transparent;
}

/* AppHeader 本身在这里可做动画 */
.header-wrapper>.app-header {
  transition: transform 0.2s ease, opacity 0.2s ease;
  transform-origin: top;
}

/* v-show 切换时会自动加/去掉 display:none，不影响动画 */
.header-wrapper>.app-header[v-cloak] {
  display: none;
}

.intro {
  position: fixed;
  inset: 0;
  z-index: 9999;
  overflow: hidden;
  cursor: pointer;
}

.intro-bg {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.4) contrast(1.1) blur(1px);
}

/* 文本区域样式 */
.intro-text {
  position: absolute;
  z-index: 2;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  gap: 0.25em;
  flex-wrap: wrap;
  font-size: 2.5rem;
  font-family: 'Segoe UI', 'Noto Sans SC', sans-serif;
  font-weight: 600;
  color: #ffc9f3;
  letter-spacing: 0.08em;
  text-align: center;
  padding: 0 2rem;

  /* 柔光透明梦幻发光 */
  text-shadow:
    0 0 6px rgba(255, 200, 255, 0.6),
    0 0 12px rgba(200, 150, 255, 0.6),
    0 0 20px rgba(255, 150, 200, 0.4);
  animation: glow-pulse 3s ease-in-out infinite alternate;
}

/* 打字动画 */
.intro-char {
  opacity: 0;
  animation: typeIn 0.5s ease-out forwards;
}

@keyframes typeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 渐变发光动画 */
@keyframes glow-pulse {
  0% {
    text-shadow:
      0 0 6px #ffc9f3,
      0 0 12px #d3b3ff,
      0 0 16px rgba(255, 180, 230, 0.5);
  }

  100% {
    text-shadow:
      0 0 12px #ffbdf7,
      0 0 24px #b18fff,
      0 0 30px rgba(255, 160, 240, 0.7);
  }
}

@media screen and (max-width: 768px) {
  .intro-text {
    font-size: 6vw;
    padding: 0 1rem;
  }
}

@media screen and (max-width: 480px) {
  .intro-text {
    font-size: 5.2vw;
    letter-spacing: 0.05em;
  }
}
</style>
