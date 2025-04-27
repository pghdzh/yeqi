<template>
  <div class="timeline-page">
    <main class="timeline-container">
      <h2 class="page-title">楪祈的经历</h2>
      <div class="timeline-list">
        <div
          v-for="(ev, idx) in timeline"
          :key="idx"
          :class="['timeline-item', idx % 2 === 0 ? 'left' : 'right']"
        >
          <div class="marker"></div>
          <div class="content">
            <div class="year">{{ ev.year }}</div>
            <div class="title">{{ ev.title }}</div>
            <div class="desc">{{ ev.description }}</div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface TimelineEvent {
  year: string;
  title: string;
  description: string;
}

const timeline = ref<TimelineEvent[]>([
  { year: '第1集 开场', title: '潜入GHQ研究所', description: '为窃取罪恶王冠的“钥匙”潜入湖畔研究所，成功偷取后被流弹击中跌入湖中；后被樱满集发现并救起。' },
  { year: '第1-2集', title: '同居与觉醒', description: '转校至集的班级并与其同居，祈对集制作的VCR产生好感，逐渐萌发自我意识与对集的情感。' },
  { year: '第4-10集', title: '并肩作战', description: '作为葬仪社成员，参与多次潜入和救援任务，与集建立深厚信任，并在战斗中相互依靠。' },
  { year: '第11集', title: '共鸣数测量', description: '集的母亲测得祈的基因共鸣数超3000，基因检测仪显示“OVER”，彰显其虚空力量异常强大。' },
  { year: '第16-17集', title: '被病毒操控', description: '真名记忆与思考的病毒被注入祈体内，为完成回收遗传因子与虚空碎片的计划，她对供奉院亚里沙等展开攻击。' },
  { year: '第18集', title: '自我发现', description: '找回真实记忆并向集告白，为保护集迎战涯派来的人，展现超凡战力，最终被囚禁于实验设施。' },
  { year: '第20集', title: '抵抗真名', description: '真名通过祈的身体与涯对话，宣称“还差一点她就可以完全属于我了”，祈强力抵抗，拒绝屈服。' },
  { year: '第21集', title: '化为真名', description: '被涯消除所有情感与记忆，留下只集能听到的歌与一滴眼泪，祈的生命化为病毒真名。' },
  { year: '第22集', title: '生命延续', description: '集击败涯后欲舍身，祈以生命线代替集逝去，意识永存于集心中，完成对集的终极守护。' }
]);

onMounted(() => {
  const items = document.querySelectorAll<HTMLElement>('.timeline-item');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );
  items.forEach((item) => observer.observe(item));
});
</script>

<style scoped lang="scss">
.timeline-page {
  position: relative;
  min-height: calc(100vh - 64px);
  padding: 80px 0;
  background: linear-gradient(135deg, #ff79c6, #bd93f9, #8be9fd);
  background-size: 600% 600%;
  animation: gradient-flow 20s ease infinite;
}

@keyframes gradient-flow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.timeline-container {
  position: relative;
  max-width: 900px;
  margin: 0 auto;
  padding: 0 16px;
}

.page-title {
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 60px;
  color: #ffffff;
  text-shadow: 0 0 8px #bd93f9;
}

.timeline-list {
  position: relative;
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 2px;
    height: 100%;
    background: linear-gradient(to bottom, rgba(255,255,255,0.1), rgba(255,255,255,0.3));
  }
}

.timeline-item {
  position: relative;
  width: 50%;
  padding: 40px 0;
  opacity: 0;
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;

  &.in-view {
    opacity: 1;
    transform: translateY(0);
  }

  &.left {
    left: 0;
    transform: translateX(-20px) translateY(20px);
    .in-view & {
      transform: translateX(0) translateY(0);
    }
    .content { margin-right: auto; }
  }
  &.right {
    left: 50%;
    transform: translateX(20px) translateY(20px);
    .in-view & {
      transform: translateX(0) translateY(0);
    }
    .content { margin-left: auto; }
  }

  .marker {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 14px;
    height: 14px;
    background: #ff79c6;
    border-radius: 50%;
    box-shadow: 0 0 8px #ff79c6;
    transition: transform 0.3s ease;
  }
  &:hover .marker {
    transform: translate(-50%, -50%) scale(1.2);
  }

  .content {
    position: relative;
    background: #ffffff;
    border-radius: 12px;
    padding: 20px 24px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.1);
    width: calc(100% - 60px);
    transition: transform 0.3s ease, box-shadow 0.3s ease;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    }

    .year {
      font-size: 0.875rem;
      color: #bd93f9;
      margin-bottom: 8px;
    }
    .title {
      font-size: 1.25rem;
      color: #333333;
      margin-bottom: 12px;
    }
    .desc {
      font-size: 1rem;
      color: #555555;
      line-height: 1.6;
    }
  }
}

@media (max-width: 768px) {
  .timeline-list:before { left: 8px; }
  .timeline-item {
    width: 100%;
    left: 0 !important;
    transform: translateX(0) translateY(20px);

    &.in-view { transform: translateY(0); }
    .content { margin: 0 0 0 32px; width: calc(100% - 40px); }
    .marker { left: 8px; }
  }
}
</style>
