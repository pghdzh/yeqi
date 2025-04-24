<template>
  <div class="home-page" @mousemove="onMouseMove">
  
    <!-- 主要内容展示 -->
    <section class="intro">
      <h1 class="main-title">楪祈 · 电子设定集</h1>
      <p class="description">
        欢迎进入幻想世界，探索楪祈的档案、设定与回忆碎片。
      </p>
      <RouterLink class="explore-button" to="/characters">开始探索</RouterLink>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'


</script>

<style scoped>
:root {
  --pink: #ff79c6;
  --purple: #bd93f9;
  --dark1: #2d004e;
  /* 视差变量 */
  --parallax-x: 0deg;
  --parallax-y: 0deg;
}

.home-page {
  padding-top: 100px;
  position: relative;
  min-height: calc(100vh - 64px);
  overflow: hidden;
  color: #fff;
  /* 动态流动渐变背景 */
  background: linear-gradient(135deg, var(--pink), var(--purple), #8be9fd);
  background-size: 600% 600%;
  animation: gradient-flow 20s ease infinite;
  /* 叠层视差变换 */
  transform: perspective(500px)
    rotateX(calc(var(--parallax-y) * 0.05))
    rotateY(calc(var(--parallax-x) * 0.05));
}

/* 流动渐变 */
@keyframes gradient-flow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* 云雾 + 噪点叠层 */
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



/* 云雾移动 */
@keyframes cloud-move {
  from { background-position: 0 0; }
  to { background-position: 1000px 0; }
}


/* 内容入场动画 */
.intro {
  position: relative;
  z-index: 1;
  text-align: center;
  margin-top: 100px;
  padding: 0 24px;
  max-width: 1200px;
  margin: 0 auto;
  animation: fadeInUp 1.5s ease-out both;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 标题 */
.main-title {
  font-size: 56px;
  font-weight: 800;
  color: var(--pink);
  text-shadow: 0 0 12px var(--pink), 0 0 24px var(--purple);
  animation: glow-text 3s infinite ease-in-out alternate;
  margin-bottom: 20px;
  transition: transform 0.3s ease;
}
.main-title:hover {
  transform: scale(1.02);
}
@keyframes glow-text {
  from {
    text-shadow: 0 0 10px var(--pink), 0 0 20px var(--purple);
  }
  to {
    text-shadow: 0 0 25px var(--pink), 0 0 40px var(--purple);
  }
}

/* 描述 */
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
  background: linear-gradient(to right, var(--pink), var(--purple));
  color: #fff;
  font-weight: bold;
  font-size: 18px;
  box-shadow: 0 0 18px var(--pink);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  animation: pulse 2s infinite ease-in-out;
  text-decoration: none;
}
.explore-button:hover {
  transform: scale(1.1);
  box-shadow: 0 0 25px var(--pink);
}
.explore-button:active {
  transform: scale(0.95);
  box-shadow: 0 0 12px var(--purple);
}
@keyframes pulse {
  0%,100% { box-shadow: 0 0 18px var(--pink); }
  50%   { box-shadow: 0 0 28px var(--purple); }
}


</style>
