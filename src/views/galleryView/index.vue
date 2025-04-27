<template>
  <div class="gallery-page" @keyup.esc="closePreview" tabindex="0">
  
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
          <img :src="img.src" :alt="img.alt" />
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

// 引入图片资源
// 假设你的图片放在 src/assets/gallery/ 目录
const imports = import.meta.glob('@/assets/img/*.{jpg,png,jpeg}', { eager: true })
const images = Object.values(imports).map((mod: any) => ({
  src: mod.default,
  alt: ''
}))

// Lightbox 状态
const preview = ref({ open: false, index: 0 })

// 打开预览
function openPreview(idx: number) {
  preview.value = { open: true, index: idx }
}

// 关闭预览
function closePreview() {
  preview.value.open = false
}

// 切换到上一张
function prevImage() {
  preview.value.index =
    (preview.value.index + images.length - 1) % images.length
}

// 切换到下一张
function nextImage() {
  preview.value.index =
    (preview.value.index + 1) % images.length
}

// 当前预览图
const currentImage = computed(() => images[preview.value.index])

// 组件获得焦点以捕捉键盘
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
  background: #0b0010;
  color: #fff;
  outline: none;
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
  text-shadow: 0 0 8px #bd93f9;
}

/* 网格布局 */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}
.grid-item {
  overflow: hidden;
  border-radius: 8px;
  cursor: pointer;
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
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
}
.grid-item:hover img {
  transform: scale(1.05);
}

/* Lightbox 预览 */
.lightbox {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}
.lightbox-img {
  max-width: 90%;
  max-height: 90%;
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(255, 121, 198, 0.8);
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

/* 响应式调整 */
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
</style>
