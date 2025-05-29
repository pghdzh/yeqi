<template>
  <div class="home-page" @mousemove="onMouseMove">
    <!-- Canvas 层 -->
    <canvas ref="canvasEl" class="rose-canvas"></canvas>
    <!-- 背景轮播放在最底层 -->
    <div class="carousel">
      <img v-for="(src, idx) in randomFive" :key="idx" :src="src" class="carousel-image"
        :class="{ active: idx === currentIndex }" />
    </div>
    <!-- 公告栏 -->
    <aside class="announcement-bar">
      <h2 class="announcement-title">
        <i class="iconfont icon-notice"></i>
        公告
      </h2>
      <ul class="announcement-list">
        <li v-for="(item, idx) in announcements" :key="idx">
          <i class="iconfont icon-dot"></i>{{ item }}
        </li>
      </ul>
    </aside>

    <!-- 主要内容展示 -->
    <section class="intro">
      <h1 class="main-title">楪祈 · 电子设定集</h1>
      <h3 class="sub-title">梦幻与科技的交织</h3>
      <p class="description">
        欢迎进入幻想世界，探索楪祈的档案、设定与回忆碎片。
      </p>
      <RouterLink class="explore-button" to="/characters">
        <span>开始探索</span>
        <i class="iconfont icon-arrow-right"></i>
      </RouterLink>
    </section>

    <!-- 名字改到右下角 -->
    <div class="starry-names right">
      <span v-for="(star, idx) in stars" :key="idx" class="star-name" :style="{
        right: star.left + '%',
        bottom: star.bottom + 'px',
        fontSize: (14 + star.size) + 'px',
        color: star.color,
        animationDelay: star.flickerDelay + 's',
        animationDuration: star.flickerDuration + 's'
      }">
        {{ star.name }}
      </span>
    </div>


    <!-- Neon 流光页脚 -->
    <footer class="neon-footer">
      <div class="footer-content">
        <p>© 2025 楪祈 · 电子设定集</p>
      </div>
    </footer>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, onBeforeUnmount } from 'vue'
import rose from '@/assets/rose.png'

const canvasEl = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D
let animationId: number
let lastTime = 0
let elapsed = 0

interface Rose {
  baseX: number
  y: number
  size: number
  speed: number
  swayAmp: number
  swayFreq: number
  phase: number
  angle: number
  angularSpeed: number
}

const roses: Rose[] = []
const ROSE_COUNT_DESKTOP = 20
const ROSE_COUNT_MOBILE = 8
const ROSE_IMG = new Image()
ROSE_IMG.src = rose

function initRoses(count: number) {
  roses.length = 0
  const canvas = canvasEl.value!
  const w = canvas.width / (window.devicePixelRatio || 1)
  const h = canvas.height / (window.devicePixelRatio || 1)

  for (let i = 0; i < count; i++) {
    const baseX = Math.random() * w
    roses.push({
      baseX,
      y: Math.random() * -h,
      size: 30 + Math.random() * 40,
      speed: 30 + Math.random() * 70,
      swayAmp: 20 + Math.random() * 20,
      swayFreq: 0.5 + Math.random() * 1,
      phase: Math.random() * Math.PI * 2,
      angle: Math.random() * Math.PI * 2,
      angularSpeed: (Math.random() - 0.5) * 2
    })
  }
  elapsed = 0
}

let resizeTimeout: number
function resizeCanvas() {
  window.clearTimeout(resizeTimeout)
  resizeTimeout = window.setTimeout(() => {
    cancelAnimationFrame(animationId)
    const canvas = canvasEl.value!
    const parent = canvas.parentElement!
    const dpr = window.devicePixelRatio || 1
    const w = parent.clientWidth
    const h = parent.clientHeight

    canvas.style.width = w + 'px'
    canvas.style.height = h + 'px'
    canvas.width = w * dpr
    canvas.height = h * dpr

    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.scale(dpr, dpr)

    const isMobile = w < 768
    initRoses(isMobile ? ROSE_COUNT_MOBILE : ROSE_COUNT_DESKTOP)
    lastTime = 0
    animationId = requestAnimationFrame(tick)
  }, 200)
}

function tick(now: number) {
  if (!lastTime) lastTime = now
  const dt = (now - lastTime) / 1000
  lastTime = now
  elapsed += dt

  const canvas = canvasEl.value!
  const w = canvas.clientWidth
  const h = canvas.clientHeight

  ctx.clearRect(0, 0, w, h)

  roses.forEach(r => {
    r.y += r.speed * dt
    const sway = r.swayAmp * Math.sin(r.phase + elapsed * r.swayFreq)
    const x = r.baseX + sway
    r.angle += r.angularSpeed * dt

    if (r.y > h + r.size) {
      r.y = -r.size
      r.baseX = Math.random() * w
      r.phase = Math.random() * Math.PI * 2
    }

    if (x > w + r.size || x < -r.size) return
    // 计算透明度
    const alpha = 1 - (r.y / h) * 0.5;
    // 限制 alpha 在 [0,1] 之间（可选）
    const clampedAlpha = Math.max(0, Math.min(1, alpha));
    ctx.save()
    ctx.globalAlpha = clampedAlpha;
    ctx.translate(x, r.y)
    ctx.rotate(r.angle)
    ctx.drawImage(ROSE_IMG, -r.size / 2, -r.size / 2, r.size, r.size)
    ctx.restore()
  })

  animationId = requestAnimationFrame(tick)
}


//背景图
// 1. 全量导入，直接映射成 string[]
const modules = import.meta.glob("@/assets/images1/*.{jpg,png,jpeg}", {
  eager: true,
});
const allSrcs: string[] = Object.values(modules).map((mod: any) => mod.default);

// 2. 洗牌并取 5 张
function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const randomFive = ref<string[]>(shuffle(allSrcs).slice(0, 5));

const currentIndex = ref(0);
let timer: number;


// 示例公告数据
const announcements = [
  '我B站账号被封了一个月，应该是6.9解封，期间无法互动，请见谅',
]

// 生成随机柔和的 HSL
function randomSoftHsl() {
  const h = Math.floor(Math.random() * 360)
  const s = 60 + Math.random() * 20
  const l = 65 + Math.random() * 10
  return `hsl(${h}, ${s}%, ${l}%)`
}

const names = ['无机甲亢', '祈愿丶楪祈']
const stars = ref(
  names.map(name => ({
    name,
    left: 5 + Math.random() * 90,
    bottom: 20 + Math.random() * 220,
    size: Math.random() * 8,        // 14px ~ 22px
    color: randomSoftHsl(),
    flickerDelay: Math.random() * 3,
    flickerDuration: 2 + Math.random() * 2
  }))
)


onMounted(() => {

  const canvas = canvasEl.value!
  ctx = canvas.getContext('2d')!

  ROSE_IMG.onload = () => {
    resizeCanvas()
  }
  window.addEventListener('resize', resizeCanvas)
  // 2. 每 5 秒切换一次
  timer = window.setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % randomFive.value.length;
  }, 5000);
});

onUnmounted(() => {
  clearInterval(timer);
});


onBeforeUnmount(() => {
  cancelAnimationFrame(animationId)
  window.removeEventListener('resize', resizeCanvas)
})
</script>

<style scoped lang="scss">
.home-page {
  position: relative;
  min-height: 100vh;
  padding-top: 164px;
  overflow: hidden;
  color: #fff;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  background: linear-gradient(to bottom, #1a1a2e 0%, #0f0c29 100%);
  
}

.rose-canvas {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  pointer-events: none;
}

.carousel {
  position: absolute;
  inset: 0;
  z-index: 0;

  /* 放在最底层 */
  /* 叠加所有图片，通过 opacity 实现切换 */
  .carousel-image {
    position: absolute;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    transition: opacity 1s ease;
    filter: blur(1.5px);
    /* 轻微模糊 */
  }

  .carousel-image.active {
    opacity: 1;
  }
}

/* 遮罩层 */
.carousel::before {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.2);
  /* 遮罩透明度可调 */
  pointer-events: none;
  z-index: 1;
}

/* 公告栏 */
.announcement-bar {
  position: absolute;
  top: 120px;
  left: 24px;
  width: 240px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-left: 4px solid #ff79c6;
  border-radius: 12px;
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
  z-index: 2;
}

.announcement-title {
  display: flex;
  align-items: center;
  font-size: 20px;
  margin-bottom: 12px;
  color: #ffbdfc;
}

.icon-notice {
  margin-right: 8px;
  font-size: 22px;
}

.announcement-list {
  list-style: none;
  padding: 0;
  margin: 0;
  color: #ddd;
  font-size: 14px;
}

.announcement-list li {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
}

.icon-dot {
  margin-right: 6px;
  font-size: 8px;
  color: #ff79c6;
}

/* 主内容 */
.intro {
  text-align: center;
  z-index: 1;
  max-width: 800px;
  margin: 0 auto;
  animation: fadeInUp 1.2s ease-out both;
}

.main-title {
  font-size: 60px;
  font-weight: 800;
  color: #ff79c6;
  text-shadow: 0 0 12px #ff79c6, 0 0 24px #bd93f9;
  margin-bottom: 8px;
}

.sub-title {
  font-size: 24px;
  color: #bd93f9;
  margin-bottom: 20px;
  opacity: 0.85;
}

.description {
  font-size: 18px;
  color: #e0e0e0;
  line-height: 1.6;
  margin-bottom: 40px;
  opacity: 0.9;
}

.explore-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 36px;
  border-radius: 50px;
  background: linear-gradient(45deg, #ff79c6, #bd93f9);
  font-size: 18px;
  font-weight: 600;
  text-decoration: none;
  color: #fff;
  box-shadow: 0 0 20px rgba(255, 121, 198, 0.6);
  transition: transform 0.3s, box-shadow 0.3s;
  animation: pulse 2s infinite ease-in-out;
}

.explore-button:hover {
  transform: scale(1.05);
  box-shadow: 0 0 28px rgba(189, 147, 249, 0.8);
}

.explore-button:active {
  transform: scale(0.95);
  box-shadow: 0 0 12px rgba(121, 198, 255, 0.8);
}

/* 星星名字 区域 */
.starry-names {
  position: absolute;
  bottom: 200px;
  right: 0;
  width: 40%;
  height: 250px;
  pointer-events: none;
}

.starry-names.right {
  left: auto;
  right: 0;
  padding-right: 16px;
  text-align: right;
}

.star-name {
  position: absolute;
  white-space: nowrap;
  font-weight: 600;
  text-shadow: 0 0 6px currentColor, 0 0 12px currentColor;
  animation: flicker linear infinite;
}

.neon-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
  overflow: hidden;
  z-index: 0;

  /* 动态线性渐变背景 */
  background: linear-gradient(270deg,
      #ff79c6,
      #bd93f9,
      #8be9fd,
      #bd93f9,
      #ff79c6);
  background-size: 600% 600%;
  animation: neonGradient 10s ease infinite;
  opacity: 0.9;

  /* 顶部朦胧光晕 */
  &::before {
    content: '';
    position: absolute;
    top: -20px;
    left: 0;
    width: 100%;
    height: 40px;
    background: radial-gradient(circle at center bottom,
        rgba(255, 121, 198, 0.4),
        transparent);
    pointer-events: none;

  }

  /* 底部柔光阴影 */
  box-shadow: 0 -4px 30px rgba(189, 147, 249, 0.6);
}

.footer-content p {
  margin: 0;
  opacity: 0.8;
}

/* 渐变流动动画 */
@keyframes neonGradient {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

/* 动画 Keyframes */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {

  0%,
  100% {
    box-shadow: 0 0 20px rgba(255, 121, 198, 0.6);
  }

  50% {
    box-shadow: 0 0 28px rgba(189, 147, 249, 0.8);
  }
}

@keyframes flicker {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.3;
  }
}
</style>
