<template>
  <div class="chat-page">
    <!-- 新增：右上角随机语音按钮 -->
    <button class="random-voice-btn" @click="playRandomAudio">
      随机语音🔉
    </button>
    <button class="download-voice-btn" @click="downloadArchive">
      下载语音⬇️
    </button>
    <!-- 背景轮播放在最底层 -->
    <div class="carousel">
      <img v-for="(src, idx) in randomFive" :key="idx" :src="src" class="carousel-image"
        :class="{ active: idx === currentIndex }" />
    </div>
    <div class="chat-container">
      <div class="messages" ref="msgList">
        <transition-group name="msg" tag="div">
          <div v-for="msg in chatLog" :key="msg.id"
            :class="['message', msg.role, { error: msg.isError }, { isEgg: msg.isEgg }]">
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
import { ref, onMounted, nextTick, watch, onUnmounted } from 'vue'
import { sendMessageToChatGPT } from "@/api/opaiApi"
function downloadArchive() {
  // 直接跳转到 public 目录下的 yeqiAudio.rar 即可触发下载
  window.location.href = '/yeqiAudio.rar';
}
//随机语音
const audioList = [
  { text: "没关系的，无论发生什么，我都会在你身边。", file: "audio (0)" },
  { text: "无论多难过，时间都会帮你治愈的。慢慢来，好吗？", file: "audio (1)" },
  { text: "人的心，真的很复杂呢。不过，这也是它有趣的地方。", file: "audio (2)" },
  { text: "有时候，我也想什么都不想，慢慢地度过时光。", file: "audio (3)" },
  { text: "嘿嘿，不能这么期待我哦？", file: "audio (4)" },
  { text: "嘿，下一次一起小睡一下好吗？就一点点，稍微休息一下。", file: "audio (5)" },
  { text: "累的时候，不要勉强自己，休息一下会更好。我会在你身边。", file: "audio (6)" },
  { text: "休息一会儿之后，我们再一起努力吧。", file: "audio (7)" },
  { text: "你好像不太精神，没事吧？不要勉强自己哦。", file: "audio (8)" },
  { text: "无论多小的事，如果你在意的话，告诉我哦。", file: "audio (9)" },
  { text: "人生真是奇妙啊。有时那微不足道的小事，竟然能带来巨大的影响。", file: "audio (10)" },
  { text: "无论多小的一步，都会通向未来。", file: "audio (11)" },
  { text: "唉，有点伤心了。但我很快就会好起来的。", file: "audio (12)" },
  { text: "有点困了呢。要不要小睡一下呢？", file: "audio (13)" },
  { text: "我希望你一切都好，保持元气哦。", file: "audio (14)" },
  { text: "慢慢来，别着急。", file: "audio (15)" },
  { text: "嘿嘿，今天说点什么好呢？如果有什么想聊的，告诉我哦！", file: "audio (16)" },
  { text: "你这么一脸难过，我都快跟着伤心了，给我个笑容吧！", file: "audio (17)" },
  { text: "如果遇到困难，不要客气，随时告诉我。我会在这里陪着你。", file: "audio (18)" },
  { text: "今天好好休息吧，别勉强自己。", file: "audio (19)" },
  { text: "有什么有趣的事吗？我也想和你一起笑一笑！", file: "audio (20)" },
  { text: "如果能看到你的笑容，我就会觉得今天特别开心！", file: "audio (21)" },
  { text: "我觉得最重要的，是享受每一天每一刻的美好。", file: "audio (22)" },
  { text: "人生中有很多相遇和离别，但每一次都有它的意义。", file: "audio (23)" },
  { text: "有点寂寞的感觉。但没关系，我会很快振作的。", file: "audio (24)" },
  { text: "今天有点累了，但能和你聊聊，我又感觉好多了。", file: "audio (25)" },
  { text: "偶尔也要放慢脚步，给心灵放个假，才能更好地前行。", file: "audio (26)" },
  { text: "不要勉强自己，休息一下会让你更有活力的。", file: "audio (27)" },
  { text: "没关系，很快就会好起来的。我一直都会支持你。", file: "audio (28)" },
  { text: "即使在难过的时候，我也会在你身边。你可以放心。", file: "audio (29)" }
];
// 新增：点击“随机语音”按钮时调用
function playRandomAudio() {
  // 随机选一条
  const idx = Math.floor(Math.random() * audioList.length);
  const { file, text } = audioList[idx];

  // 播放音频
  playVoice(file);

  // 将文字插入到 chatLog（不调用后端）
  chatLog.value.push({
    id: Date.now(),
    role: 'bot',
    text,
    // 可选：给它一个标记，以便在样式上区分
    isEgg: true
  });
}


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


interface ChatMsg {
  id: number;
  role: 'user' | 'bot';
  text: string;
  isError?: boolean;
  isEgg?: boolean;
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
  chatLog.value.push({ id: Date.now(), role: 'user', text: userText });
  input.value = '';
  loading.value = true;
  try {
    const filteredLog = chatLog.value.filter(msg => !msg.isEgg);
    const botReply = await sendMessageToChatGPT(userText, filteredLog);
    chatLog.value.push({
      id: Date.now() + 1,
      role: 'bot',
      text: botReply
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
    { id: Date.now(), role: 'bot', text: '你好，我是楪祈，有什么想知道的吗？' }
  ];
}

function clearChat() {
  if (confirm('确定要清空全部对话吗？')) {
    chatLog.value = [
      { id: Date.now(), role: 'bot', text: '你好，我是楪祈，有什么想知道的吗？' }
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
  // 2. 每 5 秒切换一次
  timer = window.setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % randomFive.value.length;
  }, 5000);

  scrollToBottom
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

/* 修改：按钮更贴合页面风格，半透明玻璃质感 + 边框光晕 */
.random-voice-btn {
  position: fixed;
  left: 16px;
  top: 84px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 0 12px rgba(255, 137, 207, 0.6);
  color: #fff;
  border-radius: 24px;
  padding: 8px 16px;
  font-weight: 500;
  transition: transform 0.2s, background 0.3s;
  z-index: 10;
  cursor: pointer;
}

.random-voice-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: scale(1.05);
}

.download-voice-btn {
  @extend .random-voice-btn;
  top: 124px; // 可根据实际布局调整位置
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 0 12px rgba(137, 196, 255, 0.6);
}

.download-voice-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: scale(1.05);
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

/* 彩蛋消息气泡 */
.message.bot.isEgg {
  /* 整条消息微微放大并抖动 */
  animation: shake 0.5s ease-in-out both;
}

/* 修改：彩蛋消息气泡添加柔和光晕和文字阴影 */
.message.bot.isEgg .bubble {
  background: rgba(255, 255, 255, 0.9);
  background: linear-gradient(135deg, rgba(255, 137, 207, 0.8), rgba(137, 196, 255, 0.8));
  color: #222;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  box-shadow: 0 4px 12px rgba(255, 137, 207, 0.4), 0 2px 6px rgba(137, 196, 255, 0.4);
  border-radius: 20px;
  padding: 10px 14px;
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
  animation: fadeInUp 0.5s cubic-bezier(.25, .8, .25, 1) forwards;
}


/* 轻微抖动效果 */
@keyframes shake {

  0%,
  100% {
    transform: translateX(0);
  }

  25% {
    transform: translateX(-4px);
  }

  75% {
    transform: translateX(4px);
  }
}

/* 从上方淡入并下移到位 */
@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
