<template>
    <div class="inori-page">
        <div class="bg-particles"></div>
        <div class="content-wrapper">
            <!-- 角色简介 -->
            <section class="detail-intro">
                <div class="avatar-wrapper">
                    <img :src="inoriImg" alt="楪祈（Yuzuriha Inori）" class="avatar" />
                </div>
                <div class="text">
                    <h1 class="name">楪祈</h1>
                    <p class="subtitle">网络歌姬 · 葬仪社 · 连接性实验体</p>
                    <p class="bio">
                        16岁少女，粉色双马尾，深红瞳眸，歌声宛若天籁。身为 Egoist 主唱，同时背负葬仪社反抗者身份；真名意识觉醒时冷酷无情，但因樱满集而拥有自我情感，成为黑暗世界中的一缕光芒。
                    </p>
                </div>
            </section>

            <!-- 基本信息 -->
            <section class="detail-section">
                <h2>角色信息</h2>
                <ul class="info-list">
                    <li><strong>外文名</strong>：ゆずりは いのり (Yuzuriha Inori)</li>
                    <li><strong>年龄·生日</strong>：16 岁 · 9 月 12 日</li>
                    <li><strong>性别</strong>：女</li>
                    <li><strong>身份</strong>：学生 / 网络歌手（Egoist）/ 葬仪社 成员</li>
                    <li><strong>声优</strong>：茅野爱衣（日）、林美秀（台）</li>
                </ul>
            </section>

            <!-- 外貌 & 属性 -->
            <section class="detail-section">
                <h2>外貌 & 属性</h2>
                <ul class="info-list">
                    <li><strong>外貌</strong>：松松束起的双马尾垂在肩头，左侧头发上有一个红色发卡；深红色瞳孔。</li>
                    <li><strong>萌属性</strong>：歌姬、三无（无口、无表情、无意识）、双马尾、粉毛、天然呆、黑化</li>
                    <li><strong>称呼</strong>：祈、祈妹、楪祈</li>
                    <li><strong>性格</strong>：善良、纯真，附带温柔与坚强；真名意识出现时疯狂而冷酷。</li>
                    <li><strong>虚空数值</strong>：Over（过高而无法测定）</li>
                    <li><strong>虚空形态</strong>：巨剑 “虚空”</li>
                </ul>
            </section>
        </div>
    </div>
</template>
<script setup lang="ts">
import inoriImg from '@/assets/img/楪祈1.png'
</script>

<style scoped>
.inori-page {
    position: relative;
    min-height: calc(100vh - 64px);
    background: linear-gradient(135deg, #1e1b44, #4f2b8b, #ff79c6);
    background-size: 600% 600%;
    animation: gradient-flow 20s ease infinite;
    color: #ffffff;
    overflow: hidden;
}

.bg-particles {
    position: absolute;
    inset: 0;
    background: url('@/assets/img/particles.gif') repeat;
    background-size: cover;
    opacity: 0.1;
    pointer-events: none;
    z-index: 1;
    filter: blur(2px);
}

.content-wrapper {
    position: relative;
    z-index: 2;
    max-width: 960px;
    margin: 0 auto;
    padding: 80px 20px 40px;
}

/* 角色简介 */
.detail-intro {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 24px;
    margin-bottom: 40px;
}

.avatar-wrapper {
    background: radial-gradient(circle at center, #ff79c6 40%, transparent 90%);
    border-radius: 50%;
    padding: 5px;
    box-shadow: 0 0 30px rgba(255, 121, 198, 0.5);
    transition: transform 0.3s ease;
}

.avatar-wrapper:hover {
    transform: scale(1.05);
}

.avatar {
    width: 200px;
    height: 200px;
    object-fit: cover;
    border-radius: 50%;
}

.text {
    flex: 1;
    min-width: 260px;
}

.text .name {
    font-size: 42px;
    font-weight: 700;
    color: #ff9edb;
    text-shadow: 0 0 8px #ff79c6;
    margin-bottom: 8px;
}

.text .subtitle {
    font-size: 18px;
    font-style: italic;
    color: #e0dfee;
    margin-bottom: 12px;
}

.text .bio {
    font-size: 16px;
    color: #d5d5d5;
    line-height: 1.6;
}

/* 通用信息块 */
.detail-section {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    padding: 24px;
    margin-top: 32px;
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.05);
}

.detail-section h2 {
    font-size: 24px;
    color: #c792ea;
    margin-bottom: 16px;
    text-shadow: 0 0 6px #c792ea;
}

/* 列表样式 */
.info-list {
    list-style: none;
    padding-left: 0;
    margin: 0;
}

.info-list li {
    font-size: 16px;
    line-height: 1.8;
    margin-bottom: 6px;
}

/* 渐变背景动画 */
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
</style>