<template>
    <div class="message-board-page">
      <AppHeader />
  
      <main class="board-container">
        <h2 class="board-title">留言板</h2>
  
        <!-- 留言列表 -->
        <ul class="message-list">
          <li v-for="msg in messages" :key="msg.id" class="message-item">
            <div class="message-meta">
              <span class="author">{{ msg.name }}</span>
              <span class="time">{{ formatTime(msg.time) }}</span>
            </div>
            <p class="message-content">{{ msg.content }}</p>
          </li>
          <li v-if="messages.length === 0" class="no-message">暂无留言，快来抢沙发吧！</li>
        </ul>
  
        <!-- 新留言表单 -->
        <form class="message-form" @submit.prevent="postMessage">
          <input
            v-model="newName"
            type="text"
            placeholder="你的大名（必填）"
            required
            class="input name-input"
          />
          <textarea
            v-model="newContent"
            rows="4"
            placeholder="留下你的想法..."
            required
            class="input content-input"
          ></textarea>
          <button type="submit" class="submit-button">提交留言</button>
        </form>
      </main>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, watch } from 'vue'
  import AppHeader from '@/components/AppHeader.vue'
  
  interface Message {
    id: string
    name: string
    content: string
    time: number
  }
  
  const STORAGE_KEY = 'yuzuriha_message_board'
  
  // 载入本地存储的留言
  const messages = ref<Message[]>([])
  onMounted(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        messages.value = JSON.parse(saved)
      } catch { }
    }
  })
  // 持久化到 localStorage
  watch(messages, (newVal) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newVal))
  }, { deep: true })
  
  // 新留言字段
  const newName = ref('')
  const newContent = ref('')
  
  // 发布留言
  function postMessage() {
    if (!newName.value.trim() || !newContent.value.trim()) return
    messages.value.unshift({
      id: Date.now().toString(),
      name: newName.value.trim(),
      content: newContent.value.trim(),
      time: Date.now()
    })
    // 清空输入
    newName.value = ''
    newContent.value = ''
  }
  
  // 时间格式化
  function formatTime(ts: number) {
    const d = new Date(ts)
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
  }
  </script>
  
  <style scoped>
  .message-board-page {
    position: relative;
    min-height: calc(100vh - 64px);
    padding-top: 80px;
    background: linear-gradient(135deg, #ff79c6, #bd93f9, #8be9fd);
    background-size: 600% 600%;
    animation: gradient-flow 20s ease infinite;
    color: #fff;
    overflow-y: auto;
  }
  
  @keyframes gradient-flow {
    0%   { background-position:   0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position:   0% 50%; }
  }
  
  .board-container {
    max-width: 700px;
    margin: 0 auto;
    padding: 24px;
  }
  
  .board-title {
    font-size: 32px;
    text-align: center;
    margin-bottom: 24px;
    text-shadow: 0 0 8px #bd93f9;
  }
  
  /* 留言列表 */
  .message-list {
    list-style: none;
    padding: 0;
    margin: 0 0 32px;
  }
  .message-item {
    background: rgba(255,255,255,0.1);
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
    transition: transform 0.2s, background 0.2s;
  }
  .message-item:hover {
    transform: translateY(-2px);
    background: rgba(255,255,255,0.15);
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
  
  /* 无留言提示 */
  .no-message {
    text-align: center;
    color: #ccc;
    font-style: italic;
  }
  
  /* 留言表单 */
  .message-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .input {
    border: none;
    border-radius: 6px;
    padding: 10px;
    font-size: 14px;
    background: rgba(255,255,255,0.2);
    color: #fff;
    resize: vertical;
    transition: background 0.2s;
  }
  .input:focus {
    background: rgba(255,255,255,0.3);
    outline: none;
  }
  .name-input {
    max-width: 200px;
  }
  .content-input {
    flex: 1;
  }
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
  