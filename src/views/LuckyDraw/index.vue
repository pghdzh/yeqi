<template>
  <div class="lottery-container">
    <!-- 左侧转盘区域 -->
    <div class="left-panel">
      <div class="wheel-wrap">
        <div class="wheel" :style="{
          background: wheelGradient,
          transform: `rotate(${rotation}deg)`
        }"></div>
        <div class="pointer">🎯</div>
        <div class="light" :style="{ opacity: lightOpacity }"></div>
      </div>
      <button class="btn-draw" :disabled="drawing || participants.length === 0" @click="startDraw">
        {{ drawing ? '抽奖进行中...' : '开始抽奖' }}
      </button>
    </div>

    <!-- 右侧列表 & 表单区域 -->
    <div class="right-panel">
      <h2>添加参与者</h2>
      <div class="input-form">
        <input v-model="form.name" placeholder="姓名" />
        <input v-model.number="form.weight" type="number" min="1" placeholder="权重" />
        <button @click="addParticipant">添加</button>
        <button @click="resetParticipants" class="btn-reset">清空列表</button>
      </div>

      <h2>参与者列表</h2>
      <div class="participant-list">
        <div 
          v-for="p in participants" 
          :key="p.id"
          :class="['participant-item', { selected: winner && p.id === winner.id }]"
        >
          <span class="dot" :style="{ background: p.color }"></span>
          <span class="name">{{ p.name }}</span>
          <span class="weight">{{ pct(p.weight) }}</span>
          <button class="btn-del" @click="removeParticipant(p.id)">×</button>
        </div>
      </div>

      <div v-if="showResult" class="result">
        <h2>恭喜 🎉 {{ winner.name }}</h2>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { gsap } from 'gsap'

interface Participant {
  id: number
  name: string
  weight: number
  color: string
}

// 参与者数据
const participants = ref<Participant[]>([])

// 抽奖状态
const drawing = ref(false)
const showResult = ref(false)
const winner = ref<Participant | null>(null)
const rotation = ref(0)
const lightOpacity = ref(0)

// 添加表单绑定
const form = ref({ name: '', weight: 1 })

// 下一个 ID
let nextId = 1

// 计算总权重
const totalWeight = computed(() =>
  participants.value.reduce((sum, p) => sum + p.weight, 0)
)

// 计算扇区渐变色
const wheelGradient = computed(() => {
  if (participants.value.length === 0) {
    return '#eee'
  }
  let acc = 0
  return `conic-gradient(${participants.value.map(p => {
    const angle = (p.weight / totalWeight.value) * 360
    const start = acc; acc += angle
    return `${p.color} ${start}deg ${acc}deg`
  }).join(',')})`
})

// 每次变更列表后重新分配颜色
function recomputeColors() {
  const len = participants.value.length
  if (len === 0) return
  const step = 360 / len
  participants.value.forEach((p, i) => {
    p.color = `hsl(${i * step}deg, 70%, 60%)`
  })
}

// 添加参与者
function addParticipant() {
  const { name, weight } = form.value
  if (!name.trim() || weight < 1) return
  participants.value.push({
    id: nextId++,
    name: name.trim(),
    weight,
    color: ''
  })
  recomputeColors()
  form.value.name = ''
  form.value.weight = 1
}

// 删除参与者
function removeParticipant(id: number) {
  participants.value = participants.value.filter(p => p.id !== id)
  recomputeColors()
}

// 清空列表
function resetParticipants() {
  participants.value = []
  nextId = 1
}

// 构造抽奖池
function makePool(): number[] {
  return participants.value.flatMap(p => Array(p.weight).fill(p.id))
}

// 百分比显示
const pct = (w: number) => ((w / totalWeight.value) * 100).toFixed(1) + '%'

// 开始抽奖
function startDraw() {
  if (drawing.value || participants.value.length === 0) return
  drawing.value = true
  showResult.value = false
  rotation.value = 0
  lightOpacity.value = 0
  winner.value = null

  const pool = makePool()
  const randId = pool[Math.floor(Math.random() * pool.length)]
  const idx = participants.value.findIndex(p => p.id === randId)

  // 计算每个扇区起始角度
  const angles = participants.value.map(p => (p.weight / totalWeight.value) * 360)
  const startAngles = angles.reduce<number[]>((acc, a, i) => {
    acc.push(i ? acc[i - 1] + angles[i - 1] : 0)
    return acc
  }, [])

  const centerAngle = startAngles[idx] + angles[idx] / 2
  const target = 360 * 4 + (360 - centerAngle)  // 四圈加对准

  gsap.to(rotation, { value: target, duration: 4, ease: 'power2.out' })
  gsap.to(lightOpacity, { value: 0.8, yoyo: true, repeat: 5, duration: 0.3 })

  gsap.delayedCall(3.8, () => {
    rotation.value = target % 360
    winner.value = participants.value[idx]
    showResult.value = true
    drawing.value = false
  })
}
</script>

<style scoped>
.lottery-container {
  display: flex;
  padding-top: 70px;
  height: calc(100vh - 70px);
  max-width: 1920px;
  margin: 0 auto;
  gap: 2rem;
}

/* 左侧 */
.left-panel {
  flex: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.wheel-wrap {
  position: relative;
  width: 500px;
  height: 500px;
  margin-bottom: 2rem;
}

.wheel {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.1);
}

.pointer {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 3rem;
  text-shadow: 0 0 6px gold;
}

.light {
  position: absolute;
  top: -5%;
  left: -5%;
  width: 110%;
  height: 110%;
  background: radial-gradient(circle, rgba(255,255,255,0.6), transparent);
}

.btn-draw {
  padding: 1rem 3rem;
  font-size: 1.3rem;
  background: #4ecdc4;
  border: none;
  border-radius: 30px;
  color: #fff;
  cursor: pointer;
}
.btn-draw:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* 右侧 */
.right-panel {
  
  flex: 1;
  padding: 1.5rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.input-form {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.input-form input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.input-form button {
  padding: 0 1rem;
  border: none;
  background: #4ecdc4;
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
}
.btn-reset {
  background: #ff6b6b;
}
.btn-reset:hover {
  opacity: 0.9;
}

.participant-list {
  max-height: 50vh;
  overflow-y: auto;
}

.participant-item {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  border-radius: 4px;
  margin-bottom: 0.3rem;
  transition: background 0.2s;
}
.participant-item.selected {
  background: rgba(255, 107, 107, 0.2);
}
.dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  margin-right: 0.5rem;
}
.name {
  flex: 1;
}
.weight {
  color: #666;
  margin-right: 0.5rem;
}
.btn-del {
  border: none;
  background: transparent;
  font-size: 1.1rem;
  cursor: pointer;
  color: #999;
}
.btn-del:hover {
  color: #444;
}

.result {
  margin-top: 1rem;
  font-size: 1.5rem;
  color: #ff6b6b;
  text-align: center;
}
</style>
