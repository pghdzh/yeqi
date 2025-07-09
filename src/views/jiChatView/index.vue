<template>
  <div class="chat-page">
    <!-- 背景轮播放在最底层 -->
    <div class="carousel">
      <img
        v-for="(src, idx) in randomFive"
        :key="idx"
        :src="src"
        class="carousel-image"
        :class="{ active: idx === currentIndex }"
      />
    </div>
    <div class="chat-container">
      <div class="messages" ref="msgList">
        <transition-group name="msg" tag="div">
          <div
            v-for="msg in chatLog"
            :key="msg.id"
            :class="[
              'message',
              msg.role,
              { error: msg.isError },
              { isEgg: msg.isEgg },
            ]"
          >
            <div class="avatar" :class="msg.role"></div>
            <div class="bubble">
              <div class="content" v-html="msg.text"></div>
            </div>
          </div>
          <div v-if="loading" class="message bot" key="loading">
            <div class="avatar bot"></div>

            <div class="bubble loading">
              正在思考中
              <span class="dots">
                <span class="dot">.</span>
                <span class="dot">.</span>
                <span class="dot">.</span>
              </span>
            </div>
          </div>
        </transition-group>
      </div>
      <form class="input-area" @submit.prevent="sendMessage">
        <input
          v-model="input"
          type="text"
          placeholder="向集提问…"
          :disabled="loading"
          @keydown="handleKeydown"
        />
        <button type="submit" :disabled="!input.trim() || loading">发送</button>
        <button type="button" class="clear-btn" @click="clearChat">
          清空全部
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch, onUnmounted } from "vue";
import { sendMessageToJi } from "@/api/deepseekApi";

// 1. 全量导入，直接映射成 string[]
const modules = import.meta.glob("@/assets/images1/*.{jpg,png,jpeg,webp}", {
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

interface ChatMsg {
  id: number;
  role: "user" | "bot";
  text: string;
  isError?: boolean;
  isEgg?: boolean;
}

const STORAGE_KEY = "ji_chat_log";

const chatLog = ref<ChatMsg[]>(loadChatLog());
const input = ref("");
const loading = ref(false);
const msgList = ref<HTMLElement>();

async function sendMessage() {
  if (!input.value.trim()) {
    return;
  }

  const userText = input.value;
  chatLog.value.push({ id: Date.now(), role: "user", text: userText });
  input.value = "";
  loading.value = true;
  try {
    const filteredLog = chatLog.value.filter((msg) => !msg.isEgg);
    const botReply = await sendMessageToJi(userText, filteredLog);
    chatLog.value.push({
      id: Date.now() + 1,
      role: "bot",
      text: botReply,
    });
  } catch (e) {
    console.error(e);
    chatLog.value.push({
      id: Date.now() + 2,
      role: "bot",
      text: "对不起，出了点问题，请稍后再试。",
      isError: true,
    });
  } finally {
    loading.value = false;
    await scrollToBottom();
  }
}

async function scrollToBottom() {
  await nextTick();
  await nextTick();
  if (msgList.value) {
    msgList.value.scrollTop = msgList.value.scrollHeight;
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
    sendMessage();
  }
}

function loadChatLog(): ChatMsg[] {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved) as ChatMsg[];
    } catch (e) {
      console.error("Failed to parse chatLog from localStorage:", e);
    }
  }

  return [
    {
      id: Date.now(),
      role: "bot",
      text: "你好，我是樱满集，有什么想知道的吗？",
    },
  ];
}

function clearChat() {
  if (confirm("确定要清空全部对话吗？")) {
    chatLog.value = [
      {
        id: Date.now(),
        role: "bot",
        text: "你好，我是樱满集，有什么想知道的吗？",
      },
    ];
    localStorage.removeItem(STORAGE_KEY);
  }
}

watch(
  chatLog,
  async (newVal) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newVal));
    await scrollToBottom();
  },
  { deep: true }
);

onMounted(() => {
  // 2. 每 5 秒切换一次
  timer = window.setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % randomFive.value.length;
  }, 5000);

  scrollToBottom;
});

onUnmounted(() => {
  clearInterval(timer);
});
</script>

<style scoped lang="scss">
.chat-page {
  height: 100vh;
  background: linear-gradient(135deg, #ff79c6, #bd93f9, #8be9fd);
  background-size: 600% 600%;
  animation: gradient-flow 20s ease infinite;
  color: #fff;
  display: flex;
  flex-direction: column;
  padding-top: 64px;
}

@keyframes gradient-flow {
  0%,
  100% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }
}

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 800px;
  margin: 0 auto;
  padding: 16px;
  gap: 12px;
  position: relative;
  height: 100%;
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

.messages {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
  padding-bottom: 100px;
  /* 为输入框留出空间 */
  scroll-behavior: smooth;
}

.message {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12px;
}

.message.user {
  flex-direction: row-reverse;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin: 0 8px;
  background-size: cover;

  flex-shrink: 0;
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.4);
}

.avatar.bot {
  background-image: url("@/assets/img/集.png");
  box-shadow: 0 0 8px #ff79c6;
}

.avatar.user {
  background: rgba(255, 255, 255, 0.8);
}

.bubble {
  max-width: 70%;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(6px);
  padding: 12px 16px;
  border-radius: 16px;
  line-height: 1.6;
  word-break: break-word;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.content {
  min-height: 20px;
}

.message.bot .bubble {
  border-radius: 16px 16px 16px 4px;
}

.message.user .bubble {
  border-radius: 16px 16px 4px 16px;
}

.message.error .bubble {
  background: rgba(255, 51, 102, 0.4);
  border: 1px solid #ff3366;
}

.dots {
  display: inline-flex;
  align-items: center;
  margin-left: 4px;
}
.dot {
  opacity: 0;
  font-size: 16px;
  animation: blink 1s infinite;
}
.dot:nth-child(1) {
  animation-delay: 0s;
}
.dot:nth-child(2) {
  animation-delay: 0.2s;
}
.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes blink {
  0%,
  100% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
}

.loading {
  color: rgba(255, 255, 255, 0.8);
}

.input-area {
  position: sticky;
  bottom: 0;
  display: flex;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  backdrop-filter: blur(6px);
  padding: 8px;
  gap: 8px;
  z-index: 10;
}

.input-area input {
  flex: 1;
  padding: 12px 20px;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 16px;
  outline: none;
  width: 50vw;
}

.input-area input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.input-area button {
  background: linear-gradient(to right, #ff79c6, #bd93f9);
  border: none;
  color: #fff;
  padding: 0 20px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s;
}

.input-area button.clear-btn {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(6px);
  color: #fff;
}

.input-area button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 600px) {
  .avatar {
    width: 36px;
    height: 36px;
  }

  .bubble {
    max-width: 80%;
    font-size: 14px;
  }
}
</style>
