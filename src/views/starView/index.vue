<template>
  <div class="home-page" @mousemove="onMouseMove">
    <!-- 背景轮播放在最底层 -->
    <div class="carousel">
      <img v-for="(src, idx) in images" :key="idx" :src="src" :class="{ active: idx === currentIndex }"
        class="carousel-image" />
    </div>
    <!-- 主要内容展示 -->
    <section class="intro">
      <h1 class="main-title">楪祈 · 电子设定集</h1>
      <p class="description">
        欢迎进入幻想世界，探索楪祈的档案、设定与回忆碎片。
      </p>
      <RouterLink class="explore-button" to="/characters">开始探索</RouterLink>
    </section>

    <!-- 底部星辰闪烁 -->
    <div class="starry-names">
      <span v-for="(star, idx) in stars" :key="idx" class="star-name" :style="{
        left: star.left + '%',
        bottom: star.bottom + 'px',
        color: star.color,
        animationDelay: star.flickerDelay + 's',
        animationDuration: star.flickerDuration + 's'
      }">
        {{ star.name }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const images = [
  new URL('/img/1.png', import.meta.url).href,
  new URL('/img/2.png', import.meta.url).href,
]

const currentIndex = ref(0)
let timer: number

onMounted(() => {
  // 2. 每 5 秒切换一次
  timer = window.setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % images.length
  }, 5000)
})

onUnmounted(() => {
  clearInterval(timer)
})

// 生成随机柔和的颜色
function randomSoftHsl() {
  const h = Math.floor(Math.random() * 360)
  const s = 60 + Math.random() * 20  // 60-80%饱和度
  const l = 65 + Math.random() * 10  // 65-75%亮度
  return `hsl(${h}, ${s}%, ${l}%)`
}

const names = [
  '无机甲亢', '祈愿丶楪祈'
]

const stars = ref(
  names.map(name => ({
    name,
    left: 5 + Math.random() * 90,          // 5% ~ 95% 水平
    bottom: 20 + Math.random() * 220,       // 20px ~ 240px 垂直
    color: randomSoftHsl(),
    flickerDelay: Math.random() * 3,        // 闪烁延迟
    flickerDuration: 2 + Math.random() * 2  // 闪烁时长 2-4s
  }))
)
</script>

<style scoped>
.home-page {
  padding-top: 100px;
  position: relative;
  min-height: calc(100vh - 64px);
  overflow: hidden;
  color: #ffffff;

}

.carousel {
  position: absolute;
  inset: 0;
  z-index: 0;
  /* 放在最底层 */
}

/* 叠加所有图片，通过 opacity 实现切换 */
.carousel-image {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 1s ease;
}

.carousel-image.active {
  opacity: 1;
}

/* 确保内容展示层级更高 */
.intro,
.starry-names {
  position: relative;
  z-index: 1;
}

.home-page::before {
  content: '';
  position: absolute;
  inset: 0;
  background: url('@/assets/cloud-noise.png') repeat;
  background-size: 800px 800px;
  filter: blur(6px);
  mix-blend-mode: overlay;
  animation: cloud-move 60s linear infinite;
  pointer-events: none;
}

@keyframes cloud-move {
  from {
    background-position: 0 0;
  }

  to {
    background-position: 1000px 0;
  }
}

/* 内容入场动画 */
.intro {
  position: relative;
  z-index: 1;
  text-align: center;
  margin: 100px auto 0;
  padding: 0 24px;
  max-width: 1200px;
  animation: fadeInUp 1.5s ease-out both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 主标题 */
.main-title {
  font-size: 56px;
  font-weight: 800;
  color: #ff79c6;
  text-shadow: 0 0 12px #ff79c6, 0 0 24px #bd93f9;
  animation: glow-text 3s infinite ease-in-out alternate;
  margin-bottom: 20px;
  transition: transform 0.3s ease;
}

.main-title:hover {
  transform: scale(1.02);
}

@keyframes glow-text {
  from {
    text-shadow: 0 0 10px #ff79c6, 0 0 20px #bd93f9;
  }

  to {
    text-shadow: 0 0 25px #ff79c6, 0 0 40px #bd93f9;
  }
}

/* 描述文字 */
.description {
  font-size: 20px;
  color: #e0e0e0;
  margin: 0 auto 40px;
  max-width: 700px;
  line-height: 1.6;
  opacity: 0.9;
}

/* 按钮 */
.explore-button {
  display: inline-block;
  padding: 14px 36px;
  border-radius: 50px;
  background: linear-gradient(to right, #ff79c6, #bd93f9);
  color: #ffffff;
  font-weight: bold;
  font-size: 18px;
  box-shadow: 0 0 18px #ff79c6;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  animation: pulse 2s infinite ease-in-out;
  text-decoration: none;
}

.explore-button:hover {
  transform: scale(1.1);
  box-shadow: 0 0 25px #ff79c6;
}

.explore-button:active {
  transform: scale(0.95);
  box-shadow: 0 0 12px #bd93f9;
}

@keyframes pulse {

  0%,
  100% {
    box-shadow: 0 0 18px #ff79c6;
  }

  50% {
    box-shadow: 0 0 28px #bd93f9;
  }
}

/* 星星名字区域 */
.starry-names {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 250px;
  /* 提高范围 */
  pointer-events: none;
  overflow: hidden;
  z-index: 2;
}

.star-name {
  position: absolute;
  white-space: nowrap;
  font-size: 16px;
  font-weight: 600;
  text-shadow: 0 0 4px currentColor, 0 0 8px currentColor;
  animation-name: flicker;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
}

/* 闪烁动画 */
@keyframes flicker {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.4;
  }
}
</style>
