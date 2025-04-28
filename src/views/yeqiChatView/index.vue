<template>
  <div class="chat-page">
    <div class="chat-container">
      <div class="messages" ref="msgList">
        <transition-group name="msg" tag="div">
          <div v-for="msg in chatLog" :key="msg.id" :class="['message', msg.role, { error: msg.isError }]">
            <div class="avatar" :class="msg.role"></div>
            <div class="bubble">
              <div class="content" v-html="msg.text"></div>
            </div>
          </div>
          <div v-if="loading" class="message bot" key="loading">
            <div class="avatar bot"></div>
            <div class="bubble loading">正在思考中</div>
          </div>
        </transition-group>
      </div>
      <form class="input-area" @submit.prevent="sendMessage">
        <input v-model="input" type="text" placeholder="向楪祈提问…" :disabled="loading" @keydown="handleKeydown" />
        <button type="submit" :disabled="!input.trim() || loading">发送</button>
        <button type="button" class="clear-btn" @click="clearChat">清空全部</button>
        <button type="button" class="voice-btn" @click="isVoiceEnabled = !isVoiceEnabled">
          {{ isVoiceEnabled ? '语音开启🔊' : '语音关闭🔇' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import { sendMessageToChatGPT } from "@/api/opaiApi"
import MarkdownIt from 'markdown-it';

const isVoiceEnabled = ref(loadVoiceSetting());
const STORAGE_VOICE_KEY = "inori_voice_enabled";
function loadVoiceSetting() {
  const saved = localStorage.getItem(STORAGE_VOICE_KEY);
  return saved !== null ? JSON.parse(saved) : true; // 默认开启
}

watch(isVoiceEnabled, (newVal) => {
  localStorage.setItem(STORAGE_VOICE_KEY, JSON.stringify(newVal));
});
function playVoice(name: string) {
  console.log('name', name)
  if (!isVoiceEnabled.value) return; // 如果语音关闭，直接跳出
  const audio = new Audio(`/voice/${name}.mp3`);
  audio.play().catch((e) => {
    console.warn('音频播放失败：', e);
  });
}

const md = new MarkdownIt();

interface ChatMsg {
  id: number;
  role: 'user' | 'bot';
  text: string;
  isError?: boolean;
}

const STORAGE_KEY = "inori_chat_log";

const chatLog = ref<ChatMsg[]>(loadChatLog());
const input = ref('');
const loading = ref(false);
const msgList = ref<HTMLElement>();

async function sendMessage() {
  if (!input.value.trim()) {
    return
  }

  const userText = input.value;
  chatLog.value.push({ id: Date.now(), role: 'user', text: md.render(userText) });
  input.value = '';
  loading.value = true;
  playVoice('thinking'); // 👈 加这里，思考中语音
  try {
    const botReply = await sendMessageToChatGPT(userText, chatLog.value);
    chatLog.value.push({
      id: Date.now() + 1,
      role: 'bot',
      text: md.render(botReply)
    });
  } catch (e) {
    console.error(e);
    playVoice('error'); // 👈 加这里，错误时播放
    chatLog.value.push({
      id: Date.now() + 2,
      role: 'bot',
      text: '对不起，出了点问题，请稍后再试。',
      isError: true
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
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
    sendMessage();
  }
}

function loadChatLog(): ChatMsg[] {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved) as ChatMsg[];
    } catch (e) {
      console.error('Failed to parse chatLog from localStorage:', e);
    }
  }


  return [
    { id: Date.now(), role: 'bot', text: md.render('你好，我是楪祈，有什么想知道的吗？') }
  ];
}

function clearChat() {
  if (confirm('确定要清空全部对话吗？')) {
    chatLog.value = [
      { id: Date.now(), role: 'bot', text: md.render('你好，我是楪祈，有什么想知道的吗？') }
    ];
    localStorage.removeItem(STORAGE_KEY);
    playVoice('clear'); // 👈 清空后播放
  }
}

watch(chatLog, async (newVal) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newVal));
  await scrollToBottom();
}, { deep: true });

onMounted(() => {
  scrollToBottom
})
</script>

<style scoped>
.chat-page {
  height: 100vh;
  background: linear-gradient(135deg, #ff79c6, #bd93f9, #8be9fd);
  background-size: 600% 600%;
  animation: gradient-flow 20s ease infinite;
  color: #fff;
  display: flex;
  flex-direction: column;
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
  background-image: url('@/assets/img/楪祈3.png');
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

/* 入场动画 */
.msg-enter-active,
.msg-leave-active {
  transition: all 0.3s ease;
}

.msg-enter-from,
.msg-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.voice-btn {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  padding: 0 16px;
  border: none;
  font-weight: bold;
  backdrop-filter: blur(6px);
  cursor: pointer;
  transition: background 0.3s;
}

.voice-btn:hover {
  background: rgba(255, 255, 255, 0.3);
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
