<template>
  <div class="gallery-container">
    <button class="upload-btn" @click="openUploadModal">上传图片</button>

    <section class="gallery section">
      <div class="sort-controls">
        <button @click="toggleSort" class="sort-btn">
          按 {{ sortBy === "like_count" ? "点赞量" : "最新上传" }} 排序
        </button>
      </div>
      <div class="gallery-grid">
        <div
          v-for="(img, index) in images"
          :key="img.id"
          class="card"
          @click="openLightbox(index)"
          ref="cards"
        >
          <div class="card-inner">
            <img
              :src="img.src"
              :alt="img.alt"
              loading="lazy"
              @load="onImageLoad($event)"
            />
            <div class="overlay">
              <span>查看大图</span>
            </div>
            <button class="like-btn" @click.stop="handleLike(img)">
              <i class="heart" :class="{ liked: img.liked }"></i>
              <span class="like-count">{{ img.likeCount }}</span>
            </button>
          </div>
        </div>
      </div>
      <!-- sentinel：用于触发无限滚动 -->
      <div ref="sentinel" class="sentinel"></div>
      <!-- 可选：加载中/结束提示 -->
      <div class="loading" v-if="loading">加载中...</div>
      <div class="finished" v-if="finished">已全部加载</div>
    </section>
    <aside class="ranking-panel">
      <div class="panel-header" @click="expanded = !expanded">
        <h3 class="ranking-title">上传排行榜</h3>
        <span class="toggle-icon">{{ expanded ? "收起▾" : "展开▸" }}</span>
      </div>
      <transition name="fade">
        <ul v-if="expanded" class="ranking-list">
          <li
            v-for="(item, idx) in rankingList"
            :key="idx"
            class="ranking-item"
            :class="`rank-${idx + 1}`"
          >
            <span class="rank">{{ idx + 1 }}</span>
            <span class="name">{{ item.nickname }}</span>
            <span class="count">{{ item.count }} 张</span>
          </li>
        </ul>
      </transition>
    </aside>
    <!-- Lightbox Modal -->
    <div v-if="lightboxOpen" class="lightbox" @click.self="closeLightbox">
      <span class="close" @click="closeLightbox">✕</span>
      <span class="prev" @click.stop="prevImage">‹</span>
      <img :src="images[currentIndex].src" :alt="images[currentIndex].alt" />
      <span class="next" @click.stop="nextImage">›</span>
    </div>

    <!-- 上传弹窗 -->
    <div
      v-if="uploadModalOpen"
      class="upload-modal-overlay"
      @click.self="closeUploadModal"
    >
      <div class="upload-modal">
        <h3>批量上传图片</h3>
        <div class="tip-container">
          <ul class="tips-list">
            <li>审核规则：1.不要 AI 图 2.不要色情倾向 3.要我能认出是楪祈。</li>
            <li>
              由于没有用户系统，我这边不好做审核反馈，但只要显示上传成功，我这边肯定能收到。
            </li>
            <li>
              如果图片数量较多请在b站私信联系我给我网盘链接，因为我云服务器比较小一次性上传太多图片可能会导致上传不上，感谢理解。
            </li>
          </ul>
        </div>
        <p class="stats">
          今日已上传：<strong>{{ uploadedToday }}</strong> 张，
          剩余可上传：<strong>{{ remaining }}</strong> 张
        </p>
        <label>
          昵称：
          <input v-model="nickname" type="text" placeholder="请输入昵称" />
        </label>
        <label>
          选择图片（最多 {{ remaining }} 张）：
          <input
            ref="fileInput"
            type="file"
            multiple
            accept="image/*"
            @change="handleFileSelect"
          />
        </label>
        <p class="tip" v-if="selectedFiles.length">
          已选 {{ selectedFiles.length }} 张
        </p>
        <div class="modal-actions">
          <button :disabled="!canSubmit || isUploading" @click="submitUpload">
            {{ isUploading ? "上传中..." : "立即上传" }}
          </button>
          <button class="cancel" @click="closeUploadModal">取消</button>
        </div>
      </div>
    </div>

    <div class="floating-chibis">
      <img
        v-for="(pet, i) in chibiList"
        :key="i"
        :src="pet.src"
        :style="{ top: pet.top + 'px', left: pet.left + 'px' }"
        class="chibi-img"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, nextTick, onBeforeUnmount } from "vue";
import { uploadImages } from "@/api/modules/images"; // 前面封装的上传接口
import { getRankingList } from "@/api/modules/ranking"; // 根据你的实际路径调整
import { gsap } from "gsap"; // ← 本地引入
import { getImagesLikesList, likeImage } from "@/api/modules/imagesLikes";
import { debounce } from "lodash";

const sortBy = ref<"uploaded_at" | "like_count">("like_count");
const order = ref<"asc" | "desc">("desc");
function toggleSort() {
  if (sortBy.value === "uploaded_at") {
    sortBy.value = "like_count";
    order.value = "desc";
  } else {
    sortBy.value = "uploaded_at";
    order.value = "desc";
  }
  pageImage.value = 1;
  images.value = [];
  finished.value = false;
  window.scrollTo(0, 0);
  loadNextPage();
}
// 获取已点赞 ID 数组
function getLikedIds(): number[] {
  const data = localStorage.getItem("likedImageIds");
  return data ? JSON.parse(data) : [];
}

// 保存已点赞 ID 数组
function setLikedIds(ids: number[]) {
  localStorage.setItem("likedImageIds", JSON.stringify(ids));
}

async function handleLike(img: ImageItem) {
  if (img.liked) return; // 已点过就不重复调用

  try {
    await likeImage(img.id); // 调用后端接口
    img.likeCount += 1; // 本地更新点赞数
    img.liked = true; // 标记已点赞

    // 更新 localStorage
    const likedIds = getLikedIds();
    likedIds.push(img.id);
    setLikedIds(likedIds);
  } catch (error) {
    console.error("点赞失败", error);
    alert("点赞失败，请稍后重试");
  }
}

interface ImageItem {
  src: string;
  alt: string;
  likeCount: number;
  id: number;
  liked: Boolean;
}

interface RankingItem {
  id?: number; // 如果接口返回有 id，可加上
  nickname: string;
  count: number;
}
const rankingList = ref<RankingItem[]>([]);
const expanded = ref(true);

// 默认分页参数（如不分页可省略）
const page = 1;
const pageSize = 99;

const fetchRanking = async () => {
  const res = await getRankingList({ page, pageSize, character_key: "yeqi" });
  if (res.success) {
    rankingList.value = res.data;
  } else {
    console.error("获取排行榜失败", res.message);
  }
};

// 响应式存放最终图片列表
const images = ref<ImageItem[]>([]);

const pageImage = ref(1);
const limit = ref(10);
const loading = ref(false);
const finished = ref(false);

const sentinel = ref<HTMLElement | null>(null);

// 1. 在外层创建一个单例 observerCard
const observerCard = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observerCard.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 }
);
// 2. 每次有新卡片时，都调用这个方法去挂载观察
async function observeNewCards(startIndex = 0) {
  await nextTick();
  const cards = document.querySelectorAll<HTMLElement>(".card");
  for (let i = startIndex; i < cards.length; i++) {
    observerCard.observe(cards[i]);
  }
}

async function loadNextPage() {
  if (loading.value || finished.value) return;
  loading.value = true;
  try {
    const res = await getImagesLikesList({
      page: pageImage.value,
      limit: limit.value,
      sortBy: sortBy.value,
      character_key: "yeqi",
      order: order.value,
    });
    const likedIds = getLikedIds();
    const list = (
      res.images as Array<{ url: string; like_count: number; id: number }>
    ).map((item) => ({
      src: item.url,
      alt: "",
      likeCount: item.like_count,
      id: item.id, // 如果需要的话，方便点赞用
      liked: likedIds.includes(item.id),
    }));
    if (list.length === 0) {
      finished.value = true;
      return;
    }
    // 记录加载前的长度，方便后面找出“新增”节点
    const oldLength = images.value.length;
    const existingIds = new Set(images.value.map((i) => i.id));
    const filtered = list.filter((item) => !existingIds.has(item.id));
    images.value.push(...filtered);
    pageImage.value++;

    observeNewCards(oldLength);
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
}

// 3. 给 loadNextPage 包装一个防抖版
const debouncedLoad = debounce(
  () => {
    loadNextPage();
  },
  200,
  { leading: true, trailing: false }
);

const lightboxOpen = ref(false);
const currentIndex = ref(0);

function openLightbox(index: number) {
  currentIndex.value = index;
  lightboxOpen.value = true;
}
function closeLightbox() {
  lightboxOpen.value = false;
}
function prevImage() {
  currentIndex.value =
    (currentIndex.value + images.value.length - 1) % images.value.length;
}
function nextImage() {
  currentIndex.value = (currentIndex.value + 1) % images.value.length;
}

// 渐显＆Blur‑Up 效果
function onImageLoad(e: Event) {
  const img = e.target as HTMLImageElement;
  const card = img.closest(".card");
  card?.classList.add("loaded");
}

// 上传弹窗逻辑

const uploadModalOpen = ref(false);
const nickname = ref("");
const fileInput = ref<HTMLInputElement>();
const selectedFiles = ref<File[]>([]);

// 从 localStorage 读取“今天”已上传数量
function getTodayKey() {
  return `uploaded_${new Date().toISOString().slice(0, 10)}`;
}
const uploadedToday = ref<number>(
  Number(localStorage.getItem(getTodayKey()) || 0)
);
const remaining = computed(() => Math.max(24 - uploadedToday.value, 0));

// 控制提交按钮
const canSubmit = computed(() => {
  return (
    nickname.value.trim().length > 0 &&
    selectedFiles.value.length > 0 &&
    selectedFiles.value.length <= remaining.value
  );
});

// 放在 script 顶部，或者 utils 里
function clearOldUploadRecords() {
  const today = new Date();
  const storage = window.localStorage;
  for (const key of Object.keys(storage)) {
    if (!key.startsWith("uploaded_")) continue;

    // key 格式 uploaded_YYYY-MM-DD
    const dateStr = key.slice("uploaded_".length);
    const recordDate = new Date(dateStr);
    if (isNaN(recordDate.getTime())) continue;

    // 计算相差天数
    const diffMs = today.getTime() - recordDate.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    // 如果超过 2 天，就删掉
    if (diffDays > 2) {
      storage.removeItem(key);
    }
  }
}

function openUploadModal() {
  clearOldUploadRecords();
  nickname.value = "";
  selectedFiles.value = [];
  if (fileInput.value) fileInput.value.value = "";
  // 每次打开重新刷新已上传数
  uploadedToday.value = Number(localStorage.getItem(getTodayKey()) || 0);
  uploadModalOpen.value = true;
}
function closeUploadModal() {
  uploadModalOpen.value = false;
}

// 本地截断到剩余数量
function handleFileSelect(e: Event) {
  const files = Array.from((e.target as HTMLInputElement).files || []);

  if (!files) return;

  const validFiles: File[] = [];
  for (const file of files) {
    if (file.size > 20 * 1024 * 1024) {
      alert(`文件太大：${file.name}，请控制在 20MB 内`);
      continue;
    }
    validFiles.push(file);
  }

  if (validFiles.length === 0) return;

  if (validFiles.length > remaining.value) {
    alert(
      `今天最多还能上传 ${remaining.value} 张，已为你截取前 ${remaining.value} 张`
    );
    selectedFiles.value = files.slice(0, remaining.value);
  } else {
    selectedFiles.value = files;
  }
}
const isUploading = ref(false);
async function submitUpload() {
  if (!canSubmit.value) return;
  isUploading.value = true;
  try {
    const res = await uploadImages(
      selectedFiles.value,
      nickname.value.trim(),
      "yeqi"
    );
    const uploadedCount = res.data.length;
    // 更新 localStorage
    uploadedToday.value += uploadedCount;
    localStorage.setItem(getTodayKey(), String(uploadedToday.value));

    alert(`成功上传 ${uploadedCount} 张图片`);
    closeUploadModal();
    // …可选：刷新画廊列表或把新图片追加到 images …
  } catch (err: any) {
    console.error(err);
    alert(err.message || "上传失败");
  } finally {
    isUploading.value = false;
  }
}

interface Chibi {
  src: string;
  top: number;
  left: number;
}

const chibiList = ref<Chibi[]>([]);
let sentinelObserver: IntersectionObserver;
// Scroll-triggered lazy animation
onMounted(async () => {
  // 1. 拉排行榜
  await fetchRanking();

  // 2. 拉第一页图片并挂载动画 observer
  await loadNextPage(); // 内部会调用 observeNewCards(oldLen)
  // 对首次卡片做一次完整 observe
  observeNewCards(0);

  // 3. 初始化 sentinelObserver，再 observe
  sentinelObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) debouncedLoad();
    },
    { rootMargin: "0px", threshold: 0.1 }
  );
  if (sentinel.value) {
    sentinelObserver.observe(sentinel.value);
  }
  // 1. 基础配置信息
  const total = 6; // 总共 9 张图（编号 1～9）
  const pickCount = 3; // 每次抽取 3 张
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // 如果已知单张小人图片的宽高，可避免超出边界；
  // 假设小人图片宽 100px、高 100px，按需替换：
  const imgWidth = 100;
  const imgHeight = 100;

  // 2. Fisher–Yates 洗牌函数
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // 3. 随机选出 3 个编号
  const nums = shuffle(Array.from({ length: total }, (_, k) => k + 1));
  const picks = nums.slice(0, pickCount);

  // 4. 生成随机位置并填充 chibiList
  chibiList.value = []; // 先清空
  picks.forEach((i) => {
    chibiList.value.push({
      src: `/QImages/1 (${i}).png`,
      left: Math.random() * (vw - imgWidth), // 保证不超出左右边界
      top: Math.random() * (vh - imgHeight), // 保证不超出上下边界
    });
  });

  // 2. 等 img 渲染到 DOM
  await nextTick();

  // 3. 给每个小人绑定 GSAP 动画
  const imgs = document.querySelectorAll<HTMLImageElement>(".chibi-img");
  imgs.forEach((img, index) => {
    const padding = 200; // 边缘预留空间
    // ✅ 初始出场动画（闪现）
    gsap.fromTo(
      img,
      { opacity: 0, scale: 0.5 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        ease: "back.out(2)",
        delay: 0.2 * index,
      }
    );

    // ✅ 鼠标靠近闪避
    img.addEventListener("mouseenter", () => {
      gsap.killTweensOf(img);

      gsap.to(img, {
        x: "+=" + ((Math.random() - 0.5) * 400).toFixed(0),
        y: "+=" + ((Math.random() - 0.5) * 400).toFixed(0),
        duration: 1.2,
        ease: "back.out(2)",
        onComplete: () => {
          // 闪避完成后，再重新启用动画
          animate(img);
        },
      });
    });

    const animate = (img: HTMLImageElement) => {
      let { x, y } = img.getBoundingClientRect();
      let deltaX = (Math.random() - 0.5) * 200;
      let deltaY = (Math.random() - 0.5) * 200;

      // 预测一下偏移后的位置
      let nextX = x + deltaX;
      let nextY = y + deltaY;

      // 校正：防漂出左、右、上、下边界
      if (nextX < padding) deltaX = padding - x;
      if (nextX + img.width > window.innerWidth - padding)
        deltaX = window.innerWidth - padding - (x + img.width);
      if (nextY < padding) deltaY = padding - y;
      if (nextY + img.height > window.innerHeight - padding)
        deltaY = window.innerHeight - padding - (y + img.height);

      gsap.to(img, {
        x: `+=${deltaX.toFixed(0)}`,
        y: `+=${deltaY.toFixed(0)}`,
        rotation: `+=${((Math.random() - 0.5) * 60).toFixed(0)}`,
        duration: 2 + Math.random() * 2,
        ease: "power1.inOut",
        onComplete: () => animate(img),
      });
    };
    animate(img);
  });
});

onBeforeUnmount(() => {
  observerCard.disconnect();
  sentinelObserver.disconnect();
  // 以及你在 onMounted 里新建的其它 Observer
});
</script>

<style lang="scss" scoped>
$bg: #0d0d0d;
$accent: #d14b4b;
$text: #fde8e8;
$highlight: #ffd700;

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.floating-chibis {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 1;
}

.chibi-img {
  position: absolute;
  width: 80px;
  user-select: none;
  transform-origin: center center;
  pointer-events: auto;
  position: absolute;
  z-index: 10;
}

.gallery-container {
  background: radial-gradient(circle at center, #111 0%, $bg 100%);
  color: $text;
  min-height: 100vh;
  padding-bottom: 60px;

  .section {
    padding: 80px 20px;
    max-width: 1200px;
    margin: 0 auto;

    .sort-controls {
      margin: 16px 0;

      .sort-btn {
        padding: 8px 20px;
        background: linear-gradient(135deg, #ff8ec4, #da70d6);
        color: #fff;
        border: none;
        border-radius: 24px;
        cursor: pointer;
        font-size: 1rem;
        font-family: "Helvetica Neue", sans-serif;
        box-shadow: 0 6px 20px rgba(218, 112, 214, 0.5),
          0 0 8px rgba(255, 142, 196, 0.7);
        transition: transform 0.2s, box-shadow 0.3s, background 0.3s;

        &:hover {
          transform: scale(1.05);
          background: linear-gradient(135deg, #fff0fb, #ffc0e8);
          color: #3d004d;
          box-shadow: 0 8px 30px rgba(218, 112, 214, 0.7),
            0 0 12px rgba(255, 142, 196, 0.9);
        }

        &:active {
          transform: scale(0.98);
          box-shadow: 0 4px 12px rgba(218, 112, 214, 0.4),
            0 0 6px rgba(255, 142, 196, 0.6);
        }
      }
    }

    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 24px;

      .card {
        perspective: 1000px;
        opacity: 0;
        transform: translateY(20px);

        &.visible {
          animation: fadeInUp 0.6s ease forwards;
        }

        &.loaded {
          // Blur-up & grayscale removed
          .card-inner img {
            filter: none;
            opacity: 1;
          }
        }

        .card-inner {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.7);
          transform-style: preserve-3d;
          transition: transform 0.5s ease, box-shadow 0.5s ease;

          &:hover {
            transform: rotateY(6deg) rotateX(3deg) scale(1.05);
            box-shadow: 0 12px 32px rgba(0, 0, 0, 0.9);
          }

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
            filter: blur(20px) grayscale(100%);
            opacity: 0.6;
            transition: filter 0.6s ease, opacity 0.6s ease;
          }

          .overlay {
            position: absolute;
            bottom: 0;
            width: 100%;
            padding: 12px 0;
            background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
            text-align: center;
            opacity: 0;
            transition: opacity 0.4s;

            span {
              color: $text;
              font-family: "Cinzel Decorative", serif;
              font-size: 1.1rem;
              letter-spacing: 1px;
              background: rgba(0, 0, 0, 0.6);
              padding: 4px 12px;
              border-radius: 20px;
            }
          }

          &:hover .overlay {
            opacity: 1;
          }

          .like-btn {
            position: absolute;
            bottom: 12px;
            right: 12px;
            background: transparent;
            border: none;
            cursor: pointer;
            z-index: 2;
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 4px;
            border-radius: 50%;
            transition: transform 0.2s ease;

            &:hover {
              transform: scale(1.3);
            }

            .heart {
              width: 24px;
              height: 24px;
              background: url("/icons/heart-red-outline.svg") no-repeat center;
              background-size: contain;
              transition: all 0.3s ease;
              filter: drop-shadow(0 0 4px rgba(255, 0, 0, 0.7));
            }

            .liked {
              background: url("/icons/heart-red-filled.svg") no-repeat center;
              background-size: contain;
              animation: pop 0.4s ease;

              /* 持续呼吸光效 */
              &::after {
                content: "";
                position: absolute;
                top: 50%;
                left: 50%;
                width: 40px;
                height: 40px;
                background: rgba(255, 0, 0, 0.3);
                border-radius: 50%;
                transform: translate(-50%, -50%) scale(0);
                animation: pulse 1.2s ease-out infinite;
                pointer-events: none;
              }
            }

            .like-count {
              font-size: 1rem;
              color: #ff4b4b;
              text-shadow: 0 0 4px rgba(0, 0, 0, 0.6);
              font-weight: bold;
            }
          }

          @keyframes pulse {
            0% {
              transform: translate(-50%, -50%) scale(0.6);
              opacity: 0.6;
            }

            50% {
              transform: translate(-50%, -50%) scale(1.2);
              opacity: 0;
            }

            100% {
              transform: translate(-50%, -50%) scale(0.6);
              opacity: 0;
            }
          }
        }
      }
    }
  }

  .lightbox {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.95);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;

    img {
      max-width: 85%;
      max-height: 85%;
      border: 3px solid $accent;
      border-radius: 8px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.9);
      animation: fadeInUp 0.4s ease;
    }

    .close,
    .prev,
    .next {
      position: absolute;
      color: $text;
      font-size: 2.5rem;
      cursor: pointer;
      user-select: none;
      padding: 8px;
      background: rgba(27, 27, 27, 0.8);
      border-radius: 50%;
      transition: background 0.3s;

      &:hover {
        background: $accent;
      }
    }

    .close {
      top: 20px;
      right: 20px;
    }

    .prev {
      left: 20px;
      top: 50%;
      transform: translateY(-50%);
    }

    .next {
      right: 20px;
      top: 50%;
      transform: translateY(-50%);
    }
  }

  /* 上传按钮 —— Inori 风格 */
  .upload-btn {
    position: fixed;
    bottom: 24px;
    right: 24px;
    padding: 14px 24px;
    background: linear-gradient(135deg, #ff8ec4, #da70d6);
    color: #fff;
    font-size: 1rem;
    font-family: "Helvetica Neue", sans-serif;
    border: none;
    border-radius: 30px;
    box-shadow: 0 8px 30px rgba(218, 112, 214, 0.5),
      0 0 8px rgba(255, 142, 196, 0.7);
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.3s;
    z-index: 10;

    &:hover {
      transform: scale(1.1);
      box-shadow: 0 12px 40px rgba(218, 112, 214, 0.7),
        0 0 12px rgba(255, 142, 196, 0.9);
      background: linear-gradient(135deg, #fff0fb, #ffc0e8);
      color: #3d004d;
    }
  }

  /* 上传弹窗遮罩 */
  .upload-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(10, 0, 20, 0.85);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
  }

  /* 弹窗主体 */
  .upload-modal {
    background: rgba(255, 255, 255, 0.05);
    padding: 36px;
    border-radius: 16px;
    width: 660px;
    color: #f8eef8;
    box-shadow: 0 12px 40px rgba(218, 112, 214, 0.6);
    border: 1px solid rgba(218, 112, 214, 0.4);
    position: relative;
    font-family: "Helvetica Neue", sans-serif;

    h3 {
      margin-bottom: 16px;
      font-size: 1.6rem;
      color: #ff8ec4;
      text-align: center;
      text-shadow: 0 0 8px rgba(255, 142, 196, 0.7);
    }

    .stats {
      margin-bottom: 20px;
      font-size: 1rem;
      text-align: center;

      strong {
        color: #da70d6;
      }
    }

    .tip-container {
      margin-top: 20px;
      padding: 16px 20px;
      background: rgba(218, 112, 214, 0.1);
      border-left: 4px solid #ff8ec4;
      border-radius: 8px;

      .tips-list {
        list-style: none;
        margin: 0;
        padding: 0;

        li {
          position: relative;
          padding-left: 28px;
          margin-bottom: 10px;
          font-size: 0.95rem;
          color: #ffe0fb;

          &::before {
            content: "✧";
            position: absolute;
            left: 0;
            top: 0;
            font-size: 1.2rem;
            color: #ff8ec4;
            text-shadow: 0 0 4px rgba(255, 142, 196, 0.6);
          }

          &:last-child {
            margin-bottom: 0;
          }
        }
      }
    }

    .tip {
      margin-top: 10px;
      font-size: 0.9rem;
      color: #ffe0fb;
      text-align: right;
    }

    label {
      display: block;
      margin-bottom: 20px;
      font-size: 0.95rem;

      input[type="text"],
      input[type="file"] {
        width: 100%;
        margin-top: 8px;
        padding: 10px 12px;
        border-radius: 8px;
        border: 1px solid #444;
        background: rgba(255, 255, 255, 0.05);
        color: #f8eef8;
        font-size: 0.95rem;
        outline: none;
        transition: border-color 0.2s, box-shadow 0.2s;

        &:focus {
          border-color: #da70d6;
          box-shadow: 0 0 6px rgba(218, 112, 214, 0.5);
        }
      }
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
      margin-top: 30px;

      button {
        padding: 12px 24px;
        border: none;
        border-radius: 24px;
        cursor: pointer;
        font-weight: bold;
        font-size: 0.95rem;
        transition: background 0.3s, box-shadow 0.3s;

        &:not(.cancel) {
          background: linear-gradient(135deg, #ff8ec4, #da70d6);
          color: #fff;
          box-shadow: 0 6px 20px rgba(218, 112, 214, 0.5);

          &:hover:not(:disabled) {
            background: linear-gradient(135deg, #fff0fb, #ffc0e8);
            box-shadow: 0 8px 30px rgba(218, 112, 214, 0.7);
            color: #3d004d;
          }

          &:disabled {
            background: #555;
            cursor: not-allowed;
            box-shadow: none;
          }
        }

        &.cancel {
          background: transparent;
          border: 2px solid #ffe0fb;
          color: #ffe0fb;

          &:hover {
            background: rgba(255, 142, 196, 0.2);
          }
        }
      }
    }
  }

  .ranking-panel {
    width: 220px;
    padding: 24px 16px;
    margin-left: 24px;
    background: rgba(20, 0, 30, 0.8);
    backdrop-filter: blur(6px);
    border-radius: 18px;
    box-shadow: 0 8px 30px rgba(218, 112, 214, 0.6),
      0 0 12px rgba(255, 142, 196, 0.4);
    position: fixed;
    top: 60px;
    right: 24px;
    color: #f0e8f8;
    font-family: "Helvetica Neue", sans-serif;

    &.collapsed {
      height: auto;
      padding-bottom: 8px;
    }

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;

      .ranking-title {
        font-size: 1.4rem;
        color: #ff8ec4;
        font-family: "Cinzel Decorative", serif;
        text-shadow: 0 0 6px rgba(255, 142, 196, 0.8);
        margin: 0;
      }

      .toggle-icon {
        font-size: 1.2rem;
        color: #da70d6;
        user-select: none;
        text-shadow: 0 0 4px rgba(218, 112, 214, 0.6);
      }
    }

    .ranking-list {
      list-style: none;
      padding: 0;
      margin: 12px 0 0;
      overflow-y: auto;
      max-height: 55vh;

      .ranking-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 12px;
        margin-bottom: 6px;
        border-radius: 14px;
        transition: background 0.3s, box-shadow 0.3s;

        &:hover {
          background: rgba(255, 142, 196, 0.1);
          box-shadow: 0 0 8px rgba(255, 142, 196, 0.4);
        }

        .rank {
          width: 28px;
          text-align: center;
          font-weight: bold;
          font-size: 1rem;
          color: #fff;
        }

        .name {
          flex: 1;
          padding: 0 8px;
          font-size: 0.9rem;
          color: #f8eef8;
          text-shadow: 0 0 4px rgba(218, 112, 214, 0.4);
        }

        .count {
          font-size: 0.85rem;
          color: #ffb3e6;
          font-weight: bold;
        }

        // 前三名渐变 & 光晕
        &.rank-1 {
          background: linear-gradient(135deg, #ff8ec4, #da70d6, #ff8ec4);
          box-shadow: 0 0 12px rgba(255, 142, 196, 0.8);
        }

        &.rank-2 {
          background: linear-gradient(135deg, #da70d6, #a040c0);
          box-shadow: 0 0 10px rgba(218, 112, 214, 0.7);
        }

        &.rank-3 {
          background: linear-gradient(135deg, #c080e0, #da70d6);
          box-shadow: 0 0 8px rgba(218, 112, 214, 0.6);
        }
      }
    }

    /* 淡入淡出动画 */
    .fade-enter-active,
    .fade-leave-active {
      transition: opacity 0.3s ease;
    }

    .fade-enter-from,
    .fade-leave-to {
      opacity: 0;
    }
  }
}
</style>
