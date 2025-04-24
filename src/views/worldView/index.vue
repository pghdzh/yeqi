<template>
    <div class="timeline-page" @mousemove="onMouseMove">
     
  
      <main class="timeline-container">
        <h2 class="page-title">楪祈的经历</h2>
        <div class="timeline-list">
          <div v-for="(ev, idx) in timeline" :key="idx" class="timeline-item">
            <div class="marker"></div>
            <div class="content">
              <h3 class="year">{{ ev.year }}</h3>
              <h4 class="title">{{ ev.title }}</h4>
              <p class="desc">{{ ev.description }}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
  
  // 基于资料整理的楪祈关键事件
  const timeline = ref([
    { year: '动画第1集', title: '盗取虚空染色体', description: '从GHQ设施中盗取虚空染色体后被通缉，逃亡中邂逅樱满集。' },
    { year: '动画第1-2集', title: '同居与觉醒', description: '转校到集的班级并与其同居，开始产生自我意识与对集的好感。' },
    { year: '贯穿全篇', title: '歌声与血液的力量', description: '其歌声和血液能抑制并消除启示病毒的结晶，关乎人类生存。' },
    { year: '多次任务', title: '战斗与匿踪', description: '作为葬仪社成员，精通刀械与枪械，具备高超的匿踪能力，参与多次潜入行动。' },
    { year: '最终决战', title: '守护与牺牲', description: '为保护集和同伴，以自身歌声与力量抗衡病毒与敌人，完成自我救赎。' },
  ])
  

  </script>
  
  <style scoped>

  
  /* 页面整体背景与渐变流动 */
  .timeline-page {
    position: relative;
    min-height: calc(100vh - 64px);
    padding-top: 80px;
    background: linear-gradient(135deg, #ff79c6, #bd93f9, #8be9fd);
    background-size: 600% 600%;
    animation: gradient-flow 20s ease infinite;
    color: #fff;
  }
  
  /* 渐变流动关键帧 */
  @keyframes gradient-flow {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  

  
  /* 主体容器 */
  .timeline-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 0 24px;
  }
  
  /* 标题 */
  .page-title {
    font-size: 32px;
    text-align: center;
    margin-bottom: 32px;
    text-shadow: 0 0 8px var(--purple);
  }
  
  /* 时间轴列表 */
  .timeline-list {
    position: relative;
    padding-left: 20px;
  }
  
  /* 时间节点 */
  .timeline-item {
    display: flex;
    position: relative;
    margin-bottom: 40px;
    padding-left: 40px;
  }
  .timeline-item::before {
    content: '';
    position: absolute;
    left: 20px; top: 0; bottom: -20px;
    width: 4px;
    background: rgba(255,255,255,0.2);
  }
  .marker {
    position: absolute;
    left: 16px; top: 4px;
    width: 12px; height: 12px;
    background: var(--pink);
    border-radius: 50%;
    box-shadow: 0 0 8px var(--pink);
  }
  
  /* 时间节点内容 */
  .content .year {
    font-size: 16px;
    color: var(--purple);
    margin: 0 0 4px;
  }
  .content .title {
    font-size: 20px;
    color: #fff;
    margin: 0 0 8px;
  }
  .content .desc {
    font-size: 14px;
    color: #000;
    line-height: 1.6;
    margin: 0;
  }
  

  </style>
  