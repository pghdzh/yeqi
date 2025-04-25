<template>
  <div class="gallery-page" @keyup.esc="closePreview" tabindex="0" ref="galleryPage">
    <!-- 顶部导航（可添加） -->

    <!-- 主体内容 -->
    <main class="container">
      <h2 class="title">图集</h2>
      <div class="grid">
        <div
          v-for="(img, idx) in images"
          :key="idx"
          class="grid-item"
          @click="openPreview(idx)"
        >
          <img :src="img.src" :alt="img.alt" loading="lazy" />
        </div>
      </div>
    </main>

    <!-- 图片预览 Lightbox -->
    <div v-if="preview.open" class="lightbox" @click.self="closePreview">
      <button class="close-btn" @click="closePreview">×</button>
      <button class="nav-btn prev" @click.stop="prevImage">‹</button>
      <img :src="currentImage.src" :alt="currentImage.alt" class="lightbox-img" />
      <button class="nav-btn next" @click.stop="nextImage">›</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const imports = import.meta.glob('@/assets/img/*.{jpg,png,jpeg}', { eager: true })
const images = Object.values(imports).map((mod: any) => ({
  src: mod.default,
  alt: ''
}))

const preview = ref({ open: false, index: 0 })
function openPreview(idx: number) {
  preview.value = { open: true, index: idx }
}
function closePreview() {
  preview.value.open = false
}
function prevImage() {
  preview.value.index = (preview.value.index + images.length - 1) % images.length
}
function nextImage() {
  preview.value.index = (preview.value.index + 1) % images.length
}
const currentImage = computed(() => images[preview.value.index])

const galleryPage = ref<HTMLElement>()
onMounted(() => {
  galleryPage.value?.focus()
})
</script>

<style scoped>
.gallery-page {
  position: relative;
  min-height: calc(100vh - 64px);
  padding-top: 80px;
  background: linear-gradient(135deg, #0b0010, #1a0f2f, #311b92);
  background-size: 600% 600%;
  animation: gradient-flow 30s ease infinite;
  color: #fff;
  outline: none;
  overflow-x: hidden;
}

@keyframes gradient-flow {
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

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.title {
  font-size: 32px;
  text-align: center;
  margin-bottom: 24px;
  text-shadow: 0 0 8px #bd93f9, 0 0 16px #ff79c6;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}
.grid-item {
  overflow: hidden;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(255, 121, 198, 0.2);
  transition: transform 0.3s, box-shadow 0.3s;
}
.grid-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s;
}
.grid-item:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 30px rgba(255, 121, 198, 0.5);
}
.grid-item:hover img {
  transform: scale(1.08);
}

.lightbox {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(10px);
  animation: fadeIn 0.3s ease;
}
.lightbox-img {
  max-width: 90%;
  max-height: 90%;
  border-radius: 12px;
  box-shadow: 0 0 30px rgba(139, 233, 255, 0.8);
  transition: transform 0.3s ease;
}

.close-btn,
.nav-btn {
  position: absolute;
  background: none;
  border: none;
  color: #fff;
  font-size: 48px;
  cursor: pointer;
  padding: 8px;
  transition: color 0.2s;
}
.close-btn:hover,
.nav-btn:hover {
  color: #ff79c6;
}
.close-btn {
  top: 16px;
  right: 24px;
}
.nav-btn.prev {
  left: 24px;
  top: 50%;
  transform: translateY(-50%);
}
.nav-btn.next {
  right: 24px;
  top: 50%;
  transform: translateY(-50%);
}

@media (max-width: 600px) {
  .grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
  }
  .title {
    font-size: 28px;
  }
  .close-btn,
  .nav-btn {
    font-size: 36px;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.98);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>