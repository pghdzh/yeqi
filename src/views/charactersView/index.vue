<template>
    <div class="yuzuriha-page" >
        <div class="content-wrapper">
            <section class="detail-intro">
                <img :src="yeqi" alt="楪祈" class="avatar" />
                <div class="text">
                    <h1 class="name">楪祈</h1>
                    <p class="title">女神歌姬 · 祈愿之声</p>
                    <p class="bio">
                        楪祈，拥有天籁歌声的神秘少女。她的歌声能抚慰心灵，却也隐藏着对过去的伤痛与渴望。
                        传说她的声音能唤醒沉睡的记忆，将星辰化作音符，谱写出属于自己的华彩乐章。
                    </p>
                </div>
            </section>

            <section class="detail-section">
                <h2>能力</h2>
                <ul class="abilities">
                    <li>祈愿之歌：能够治愈同伴的心灵创伤</li>
                    <li>星光幻音：短暂操控光与影的流动</li>
                    <li>遗忘涌动：唤醒深层记忆与梦境</li>
                </ul>
            </section>

            <section class="detail-section">
                <h2>背景故事</h2>
                <p>
                    她来自被遗忘的古老王国，自幼在星空下歌唱。王国覆灭后，她流浪于世界各地，
                    用歌声寻找拯救之道。如今，她将所有的祈愿寄托于旋律，希望在音符中给予人们新的力量。
                </p>
            </section>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import yeqi from '@/assets/img/楪祈1.png'

</script>

<style scoped>


/* 主背景：纯渐变流动 */
.yuzuriha-page {
    position: relative;
    min-height: calc(100vh - 64px);
    padding-top: 100px;
    overflow: hidden;
    color: #fff;
    background: linear-gradient(135deg, #ff79c6, #bd93f9, #8be9fd);
    background-size: 600% 600%;
    animation: gradient-flow 20s ease infinite;
}

/* 渐变流动动画 */
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



/* 头像与简介 */
.detail-intro {
    display: flex;
    align-items: center;
    gap: 32px;
    padding: 24px;
}

.avatar {
    flex-shrink: 0;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    object-fit: cover;
    box-shadow: 0 0 15px var(--pink);
    transition: transform 0.3s ease;
}

.avatar:hover {
    transform: scale(1.05);
}

.text .name {
    font-size: 42px;
    margin: 0 0 8px;
    color: var(--pink);
    text-shadow: 0 0 12px var(--pink), 0 0 24px var(--purple);
}

.text .title {
    font-size: 18px;
    color: #e0e0e0;
    margin-bottom: 16px;
}

.text .bio {
    font-size: 16px;
    color: #ccc;
    line-height: 1.6;
    margin-bottom: 16px;
}

.back-button {
    color: #fff;
    text-decoration: none;
    font-size: 14px;
    border: 1px solid var(--pink);
    padding: 6px 12px;
    border-radius: 4px;
    transition: background 0.3s, color 0.3s;
}

.back-button:hover {
    background: var(--pink);
    color: #000;
}

/* 能力、背景小节 */
.detail-section {
    background: rgba(255, 255, 255, 0.05);
    margin: 24px;
    padding: 16px;
    border-radius: 8px;
}

.detail-section h2 {
    margin-top: 0;
    color: var(--purple);
    font-size: 24px;
    text-shadow: 0 0 8px var(--purple);
}

.abilities {
    list-style: none;
    padding: 0;
    margin: 0;
}

.abilities li {
    margin-bottom: 8px;
    font-size: 16px;
    position: relative;
    padding-left: 16px;
}

.abilities li::before {
    content: '•';
    position: absolute;
    left: 0;
    color: var(--pink);
}


</style>