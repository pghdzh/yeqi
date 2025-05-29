<template>
  <div class="message-board-page">
    <!-- 背景轮播放在最底层 -->
    <div class="carousel">
      <img v-for="(src, idx) in randomFive" :key="idx" :src="src" class="carousel-image"
        :class="{ active: idx === currentIndex }" />
    </div>
    <main class="board-container">
      <h2 class="board-title">留言板</h2>

      <div class="board-content">
        <!-- 可滚动的留言列表 -->
        <ul class="message-list">
          <li v-for="msg in messages" :key="msg.id" class="message-item">
            <div class="message-meta">
              <span class="author">{{ msg.name }}</span>
              <span class="time">{{ formatTime(msg.created_at) }}</span>
            </div>
            <p class="message-content">{{ msg.content }}</p>
          </li>
          <li v-if="!loading && messages.length === 0" class="no-message">
            暂无留言，快来抢沙发吧！
          </li>
        </ul>

        <!-- 粘性表单 -->
        <form class="message-form" @submit.prevent="postMessage">
          <input v-model="newName" type="text" placeholder="昵称" required class="input name-input" />
          <textarea v-model="newContent" rows="4" placeholder="留下你的想法..." required
            class="input content-input"></textarea>
          <button type="submit" class="submit-button">
            提交留言
          </button>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { getMessageList, createMessage } from '@/api/modules/message' // 按实际路径修改

import { ref, onMounted, onUnmounted } from 'vue';


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




interface Message {
  id: number
  name: string
  content: string
  created_at: string
}

const messages = ref<Message[]>([])
const newName = ref('')
const newContent = ref('')
const loading = ref(false)
const NAME_STORAGE_KEY = 'yuzuriha_message_board_name'

// 获取留言列表
async function fetchMessages() {
  loading.value = true
  try {
    const res = await getMessageList({ page: 1, pageSize: 50 }) // 简单分页
    messages.value = res.data || []
  } catch (err) {
    console.error('获取留言失败', err)
  } finally {
    loading.value = false
  }
}

// 发布留言
async function postMessage() {
  if (!newName.value.trim() || !newContent.value.trim()) return

  try {
    await createMessage({
      name: newName.value.trim(),
      content: newContent.value.trim()
    })
    // 保存昵称到 localStorage
    localStorage.setItem(NAME_STORAGE_KEY, newName.value.trim())
    newContent.value = ''
    await fetchMessages()
  } catch (err) {
    console.error('提交失败', err)
  }
}

// 时间格式化
function formatTime(input: string) {
  const d = new Date(input)
  const YYYY = d.getFullYear()
  const MM = String(d.getMonth() + 1).padStart(2, '0')
  const DD = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${YYYY}-${MM}-${DD} ${hh}:${mm}`
}

// onMounted 初始化昵称 & 拉取留言
onMounted(() => {
  const savedName = localStorage.getItem(NAME_STORAGE_KEY)
  if (savedName) newName.value = savedName

  fetchMessages()

  // 2. 每 5 秒切换一次
  timer = window.setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % randomFive.value.length;
  }, 5000);
})

onUnmounted(() => {
  clearInterval(timer);
});

</script>

<style scoped lang="scss">
.message-board-page {
  position: relative;
  min-height: 100vh;
  padding-top: 64px;
  background: linear-gradient(135deg, #ff79c6, #bd93f9, #8be9fd);
  background-size: 600% 600%;
  animation: gradient-flow 20s ease infinite;
  color: #fff;
  overflow: hidden;
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


.board-container {
  display: flex;
  flex-direction: column;
  /* 根据 AppHeader 实际高度调整 */
  height: calc(100vh - 80px);
  max-width: 700px;
  margin: 0 auto;
  padding: 24px;
  z-index: 10;
}

.board-title {
  font-size: 32px;
  text-align: center;
  margin-bottom: 16px;
  text-shadow: 0 0 8px #bd93f9;
  z-index: 10;
}

/* 内容区：留言列表 + 表单 */
.board-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  z-index: 10;
}

/* 留言列表 */
.message-list {
  flex: 1;
  overflow-y: auto;
  list-style: none;
  margin: 0 0 16px;
  padding: 0;
}

/* 自定义滚动条 */
.message-list::-webkit-scrollbar {
  width: 4px;
}

.message-list::-webkit-scrollbar-track {
  background: transparent;
}

.message-list::-webkit-scrollbar-thumb {
  background-color: gainsboro;
  border-radius: 4px;
}

.message-item {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  transition: transform 0.2s, background 0.2s;
}

.message-item:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.15);
}

.message-meta {
  font-size: 12px;
  color: #ddd;
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.author {
  font-weight: bold;
  color: #ff79c6;
}

.time {
  font-style: italic;
}

.message-content {
  font-size: 16px;
  line-height: 1.5;
}

.no-message {
  text-align: center;
  color: #ccc;
  font-style: italic;
}

/* 粘性表单 */
.message-form {
  position: sticky;
  bottom: 0;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
  padding: 16px;
  border-radius: 8px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 表单输入 */
.input {
  border: none;
  border-radius: 6px;
  padding: 10px;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  resize: vertical;
  transition: background 0.2s;
}

.input:focus {
  background: rgba(255, 255, 255, 0.3);
  outline: none;
}

.name-input {
  max-width: 200px;
}

.content-input {
  flex: 1;
}

/* 提交按钮 */
.submit-button {
  align-self: flex-end;
  padding: 10px 24px;
  border-radius: 24px;
  background: linear-gradient(to right, #ff79c6, #bd93f9);
  border: none;
  font-size: 16px;
  color: #fff;
  cursor: pointer;
  box-shadow: 0 0 12px #ff79c6;
  transition: transform 0.2s, box-shadow 0.2s;
}

.submit-button:hover {
  transform: scale(1.05);
  box-shadow: 0 0 16px #ff79c6;
}

/* 响应式 */
@media (max-width: 600px) {
  .message-board-page {
    padding-top: 60px;
  }

  .board-title {
    font-size: 28px;
  }

  .submit-button {
    width: 100%;
    text-align: center;
  }
}
</style>
