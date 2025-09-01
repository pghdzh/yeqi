<template>
  <div class="wiki-page">
    <!-- 背景轮播放在最底层 -->
    <div class="carousel">
      <img v-for="(src, idx) in randomFive" :key="idx" :src="src" class="carousel-image"
        :class="{ active: idx === currentIndex }" />
    </div>
    <header class="wiki-header">
      <div class="title">
        <h1>楪祈设定 Wiki</h1>
        <p class="subtitle">暂定初版，有什么想优化的都可以随时私信我哦</p>
      </div>
      <div class="actions">
        <input v-model="search" class="search" placeholder="搜索标题或者标签..." />
        <button class="btn btn-new" @click="openCreate">新建词条</button>
      </div>
    </header>

    <main class="wiki-body">
      <div v-if="filteredEntries.length === 0" class="empty">没有找到匹配的词条 ✨</div>

      <ul class="entry-list">
        <li v-for="entry in filteredEntries" :key="entry.id" class="entry-card">
          <div class="entry-head">
            <div class="entry-meta" @click="openDetail(entry)">
              <div class="entry-title-wrap">
                <h2 class="entry-title">{{ entry.title }}</h2>
                <span class="entry-badge">#{{ entry.slug || '未设置' }}</span>
              </div>
              <div class="entry-info">
                <span class="meta-item">作者：{{ entry.author }}</span>
                <span class="meta-item">时间：{{ formatTime(entry.updatedAt) }}</span>
              </div>
            </div>

            <div class="entry-actions">
              <button class="like" :class="{ active: isLiked(entry.id) }" :aria-pressed="isLiked(entry.id)"
                @click.stop="toggleLike(entry.id)">
                <img :src="isLiked(entry.id) ? '/icons/heart-red-filled.svg' : '/icons/heart-red-outline.svg'"
                  alt="like" />
                <span class="like-count">{{ entry.likes }}</span>
              </button>
              <div class="edit-delete" v-if="canEdit(entry.id)">
                <button class="small" @click="openEdit(entry)">编辑</button>
                <button class="small danger" @click="remove(entry.id)">删除</button>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </main>

    <!-- Edit/Create Modal -->
    <transition name="fade-zoom">
      <div class="modal-overlay" v-if="showModal">
        <div class="modal">
          <header class="modal-header">
            <h3>{{ editing ? '编辑词条' : '新建词条' }}</h3>
            <button class="close" @click="closeModal">✕</button>
          </header>
          <section class="modal-body">
            <label>
              标题
              <input v-model="form.title" placeholder="输入标题" />
            </label>

            <label>
              词条（短标签）
              <input v-model="form.slug" placeholder="比如：人物、剧情、世界观" />
            </label>

            <label>
              作者
              <input v-model="form.author" placeholder="作者昵称" />
            </label>

            <label>
              内容
              <textarea v-model="form.content" rows="8" placeholder="在这里输入词条内容"></textarea>
            </label>
          </section>
          <footer class="modal-footer">
            <button class="btn ghost" @click="closeModal">取消</button>
            <button class="btn" @click="submit">{{ editing ? '保存' : '创建' }}</button>
          </footer>
        </div>
      </div>
    </transition>

    <!-- Detail Modal -->
    <transition name="fade-zoom">
      <div class="modal-overlay" v-if="detailEntry">
        <div class="modal detail-modal">
          <header class="modal-header">
            <h3>{{ detailEntry.title }}</h3>
            <button class="close" @click="detailEntry = null">✕</button>
          </header>
          <section class="modal-body">
            <div class="detail-content" v-html="detailEntry.content"></div>
          </section>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getWikiList, createWiki, updateWiki, deleteWiki, likeWiki } from '@/api/modules/wiki'

// 本地存储自己创建的词条 ID
const LS_MY_WIKI_IDS = 'yuzuriha:wiki:my_ids'
const myWikiIds: string[] = JSON.parse(localStorage.getItem(LS_MY_WIKI_IDS) || '[]')
const markAsMine = (id: string | number) => {
  if (!myWikiIds.includes(String(id))) {
    myWikiIds.push(String(id))
    localStorage.setItem(LS_MY_WIKI_IDS, JSON.stringify(myWikiIds))
  }
}
const canEdit = (id: string | number) => myWikiIds.includes(String(id))

// 数据状态
const entries = ref<any[]>([])

// 本地存储键
const LS_LIKED_IDS = 'yuzuriha:wiki:liked_ids'
// 从 localStorage 读取已点赞 id 列表（字符串形式）
const likedIds = ref<string[]>(JSON.parse(localStorage.getItem(LS_LIKED_IDS) || '[]'))

const showModal = ref(false)
const editing = ref(false)
const editingId = ref<string | number | null>(null)
const detailEntry = ref<any>(null)
const form = reactive({ title: '', slug: '', author: '', content: '' })
const search = ref('')

// 时间格式化
function formatTime(ts: string | number | null | undefined) {
  if (!ts) return '未知时间'
  const date = new Date(ts)
  if (isNaN(date.getTime())) return '未知时间'
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 加载词条列表
async function loadEntries() {
  try {
    const res = await getWikiList()
    entries.value = res.data.map((e: any) => ({ ...e, createdAt: e.createdAt || e.created_at, updatedAt: e.updatedAt || e.updated_at }))
  } catch (err) {
    console.error(err)
    ElMessage.error('加载词条失败')
  }
}

// 打开/关闭弹窗
function openCreate() {
  editing.value = false
  editingId.value = null
  form.title = ''
  form.slug = ''

  form.content = ''
  showModal.value = true
}
function openEdit(entry: any) {
  if (!canEdit(entry.id)) {
    ElMessage.warning('只有创建者可以编辑')
    return
  }
  editing.value = true
  editingId.value = entry.id
  form.title = entry.title
  form.slug = entry.slug
  form.author = entry.author
  form.content = entry.content
  showModal.value = true
}
function closeModal() { showModal.value = false }

const canSubmit = computed(() => form.title.trim() && form.content.trim())

// 提交
async function submit() {
  if (!canSubmit.value) { ElMessage.warning('请填写标题和内容'); return }
  const payload = { title: form.title.trim(), author: form.author.trim() || '匿名', content: form.content.trim() }
  if (form.slug.trim()) payload.slug = form.slug.trim()
  try {
    if (editing.value && editingId.value) {
      await updateWiki(editingId.value, payload)
      ElMessage.success('编辑成功')
    } else {
      const res = await createWiki(payload)
      markAsMine(res.data.id)
      editingId.value = res.data.id
      ElMessage.success('创建成功')
    }
    showModal.value = false
    loadEntries()
  } catch (err) {
    console.error(err)
    ElMessage.error('提交失败')
  }
}

// 删除
async function remove(id: string | number) {
  if (!canEdit(id)) { ElMessage.warning('只有创建者可以删除'); return }
  if (!confirm('确认删除该词条？此操作不可撤销')) return
  try {
    await deleteWiki(id)
    const index = myWikiIds.indexOf(String(id))
    if (index !== -1) myWikiIds.splice(index, 1)
    localStorage.setItem(LS_MY_WIKI_IDS, JSON.stringify(myWikiIds))
    ElMessage.success('删除成功')
    loadEntries()
  } catch (err) {
    console.error(err)
    ElMessage.error('删除失败')
  }
}

// 点赞
function persistLikedIds() {
  try {
    localStorage.setItem(LS_LIKED_IDS, JSON.stringify(likedIds.value))
  } catch (e) {
    console.warn('保存 likedIds 失败', e)
  }
}

// 判断是否已点赞（供模板绑定 class/aria-pressed）
function isLiked(id: string | number) {
  return likedIds.value.includes(String(id))
}

// 点赞 / 取消点赞（乐观更新，本地仅存 id，点赞数使用 entry.likes）
async function toggleLike(id: string | number) {
  const entry = entries.value.find(e => e.id === id)
  if (!entry) return

  const idStr = String(id)
  const wasLiked = likedIds.value.includes(idStr)

  // 乐观更新 UI（立即反映）
  if (wasLiked) {
    // 取消点赞：保证不低于 0
    entry.likes = Math.max(0, (entry.likes || 0) - 1)
    likedIds.value = likedIds.value.filter(x => x !== idStr)
  } else {
    // 点赞
    entry.likes = (entry.likes || 0) + 1
    likedIds.value.push(idStr)
  }
  persistLikedIds()

  try {
    // 调用后端（action: 'like' | 'unlike' | 'toggle'）
    // 我们明确传 'like' 或 'unlike'
    const action = wasLiked ? 'unlike' : 'like'
    await likeWiki(id, action)

    // 可选：如果后端在响应中返回了最新的 likes 数（res.data.likes），
    // 你可以在这里用后端值覆盖本地（示例注释）
    // const res = await likeWiki(id, action)
    // if (res?.data?.likes !== undefined) entry.likes = res.data.likes

  } catch (err) {
    // 出错则回滚乐观更新
    console.error('toggleLike error', err)
    if (wasLiked) {
      // 取消点赞失败 -> 重新标记为已点赞
      entry.likes = (entry.likes || 0) + 1
      if (!likedIds.value.includes(idStr)) likedIds.value.push(idStr)
    } else {
      // 点赞失败 -> 取消之前增加的 count
      entry.likes = Math.max(0, (entry.likes || 0) - 1)
      likedIds.value = likedIds.value.filter(x => x !== idStr)
    }
    persistLikedIds()
    ElMessage.error('点赞失败，请稍后重试')
  }
}

// 详情弹窗
async function openDetail(entry: any) { detailEntry.value = entry }

// 搜索过滤
const filteredEntries = computed(() => {
  const q = String(search.value || '').trim().toLowerCase()
  let list = entries.value

  // 搜索过滤
  if (q) {
    list = list.filter(
      e =>
        (e.title || '').toLowerCase().includes(q) ||
        (e.slug || '').toLowerCase().includes(q)
    )
  }

  // 按点赞数排序（默认降序：点赞多的在前）
  return [...list].sort((a, b) => (b.likes || 0) - (a.likes || 0))
})

// 1. 分别导入两套图
const pcModules = import.meta.glob("@/assets/images1/*.{jpg,png,jpeg,webp}", { eager: true });
const mobileModules = import.meta.glob("@/assets/images2/*.{jpg,png,jpeg,webp}", { eager: true });

const pcSrcs: string[] = Object.values(pcModules).map((m: any) => m.default);
const mobileSrcs: string[] = Object.values(mobileModules).map((m: any) => m.default);

// 洗牌函数
function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const randomFive = ref<string[]>([]);
const currentIndex = ref(0);
let timer: number;

function pickImages() {
  const isMobile = window.innerWidth < 768;
  const all = isMobile ? mobileSrcs : pcSrcs;
  randomFive.value = shuffle(all).slice(0, 5);
}

onMounted(() => {
  loadEntries();
  pickImages(); // 首次判断
  // 监听窗口大小变化
  window.addEventListener("resize", pickImages);

  // 轮播
  timer = window.setInterval(() => {
    if (randomFive.value.length > 0) {
      currentIndex.value = (currentIndex.value + 1) % randomFive.value.length;
    }
  }, 5000);
});

onUnmounted(() => {
  clearInterval(timer);
  window.removeEventListener("resize", pickImages);
});

</script>

<style scoped lang="scss">
.wiki-page {
  min-height: 100vh;
  color: #fdf9ff;
  padding: 16px;
  box-sizing: border-box;
  padding-top: 80px;

  .carousel {
    position: absolute;
    inset: 0;
    z-index: -9;

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

  .wiki-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: linear-gradient(90deg, rgba(156, 107, 223, 0.12), rgba(246, 208, 235, 0.08));
    border-radius: 12px;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.4);
    flex-wrap: wrap;

    .title {
      h1 {
        margin: 0;
        font-size: 18px;
        color: #9c6bdf;
        font-weight: 600;
      }

      .subtitle {
        font-size: 12px;
        color: #d6c6e6;
      }
    }

    .actions {
      display: flex;
      gap: 8px;
      align-items: center;
      flex-wrap: wrap;
    }

    .search {
      padding: 6px 10px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.15);
      background: rgba(255, 255, 255, 0.05);
      color: #fdf9ff;
      font-size: 13px;
      box-shadow: inset 0 2px 6px rgba(255, 255, 255, 0.06);
      transition: all 0.25s;

      &:focus {
        border-color: #c4a0ff;
        box-shadow: 0 0 6px #c4a0ff;
        outline: none;
      }
    }

    .btn-new {
      background: linear-gradient(135deg, #a87eff, #f8c6ff);
      color: #fff;
      border: none;
      border-radius: 12px;
      padding: 8px 16px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(168, 126, 255, 0.4);
      position: relative;
      overflow: hidden;
      transition: all 0.25s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 18px rgba(168, 126, 255, 0.5);
        background: linear-gradient(135deg, #c4a0ff, #ffc0eb);
      }

      &:active {
        transform: translateY(0);
        box-shadow: 0 3px 10px rgba(168, 126, 255, 0.3);
      }

      &:after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%);
        opacity: 0;
        transition: all 0.4s;
      }

      &:hover:after {
        opacity: 1;
      }
    }
  }

  .wiki-body {
    margin-top: 12px;

    .empty {
      text-align: center;
      padding: 40px 16px;
      color: #d6c6e6;
    }

    .entry-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: grid;
      gap: 16px;

      .entry-card {
        background: #2d1a3a;
        border-radius: 12px;
        padding: 12px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
        transition: all 0.25s ease;
        opacity: 0.8;

        &:hover {
          background: linear-gradient(145deg, #3a2052, #4b2a70);
          box-shadow: 0 16px 32px rgba(156, 107, 223, 0.5);

          .entry-title {
            text-shadow: 0 0 8px #c4a0ff;
          }
        }

        .entry-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 8px;
          flex-wrap: wrap;

          .entry-meta {
            flex: 1;
            cursor: pointer;

            .entry-title-wrap {
              display: flex;
              align-items: center;
              gap: 8px;
            }

            .entry-title {
              font-size: 16px;
              margin: 0;
              color: #9c6bdf;
              font-weight: 500;
            }

            .entry-badge {
              display: inline-block;
              padding: 2px 8px;
              border-radius: 999px;
              background: rgba(246, 208, 235, 0.12);
              color: #f6d0eb;
              font-size: 12px;
              border: 1px solid rgba(246, 208, 235, 0.08);
            }

            .entry-info {
              display: flex;
              flex-wrap: wrap;
              gap: 8px;
              margin-top: 6px;

              .meta-item {
                font-size: 12px;
                color: #d6c6e6;
                background: rgba(156, 107, 223, 0.12);
                border-radius: 6px;
                padding: 2px 8px;
                display: flex;
                align-items: center;
              }
            }
          }

          .entry-actions {
            display: flex;
            gap: 8px;
            align-items: center;
            flex-wrap: wrap;

            .like {
              background: transparent;
              border: none;
              display: flex;
              align-items: center;
              gap: 6px;
              cursor: pointer;
              transition: transform 0.18s cubic-bezier(.2, .9, .3, 1);

              img {
                width: 20px;
                height: 20px;
              }

              .like-count {
                font-size: 13px;
                color: #d6c6e6;
              }

              &.active {
                transform: scale(1.18);
              }
            }

            .edit-delete {
              display: flex;
              gap: 6px;
            }

            .small {
              padding: 8px 10px;
              border-radius: 8px;
              background: rgba(255, 255, 255, 0.08);
              border: 1px solid rgba(255, 255, 255, 0.05);
              color: #fdf9ff;
              font-size: 13px;
            }

            .danger {
              background: transparent;
              color: #ff8b8b;
              border: 1px solid rgba(255, 80, 80, 0.15);
            }
          }
        }
      }
    }
  }

  /* Modal */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;

    .modal {
      width: min(720px, 94%);
      max-height: 90vh;
      overflow-y: auto;
      background: rgba(45, 26, 58, 0.95);
      backdrop-filter: blur(8px);
      border-radius: 14px;
      padding: 14px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7);

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 8px;

        h3 {
          margin: 0;
          color: #9c6bdf;
        }

        .close {
          background: transparent;
          border: none;
          font-size: 18px;
          color: #d6c6e6;
          cursor: pointer;
        }
      }

      .modal-body {
        color: #fdf9ff;
        font-size: 14px;
        line-height: 1.6;
        display: flex;
        flex-direction: column;
        gap: 12px;

        label {
          display: flex;
          flex-direction: column;
          gap: 4px;

          input,
          textarea {
            background: rgba(255, 255, 255, 0.05);
            color: #fdf9ff;
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 8px;
            padding: 6px 10px;
          }
        }


      }

      .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 12px;

        .btn {
          background: linear-gradient(135deg, #a87eff, #f8c6ff);
          color: #fff;
          padding: 8px 16px;
          border-radius: 12px;
          border: none;
          cursor: pointer;
        }

        .btn.ghost {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
      }
    }
  }

  /* Transition */
  .fade-zoom-enter-active,
  .fade-zoom-leave-active {
    transition: all 0.3s ease;
  }

  .fade-zoom-enter-from,
  .fade-zoom-leave-to {
    opacity: 0;
    transform: scale(0.92);
  }
}

/* 移动端优化 */
@media(max-width:720px) {
  .wiki-header {
    flex-direction: column;
  }

  .entry-list {
    display: flex;
    flex-direction: column;
  }

  .modal {
    width: 94%;
    max-height: 94vh;
  }

  .entry-actions {
    /* 垂直排列，拉伸到容器宽度 */
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  /* 让点赞按钮和编辑/删除块占满整行 */
  .entry-actions .like,
  .entry-actions .edit-delete {
    width: 100%;
    display: flex;
    align-items: center;
  }

  /* 点赞按钮内元素左对齐，图标与文字分开 */
  .entry-actions .like {
    justify-content: flex-start;
    padding: 8px 10px;
  }

  .entry-actions .like img {
    /* 给图标一些右边距，防止挤在一块 */
    margin-right: 8px;
  }

  /* 编辑/删除容器变成竖排，每个按钮独占一行 */
  .entry-actions .edit-delete {
    flex-direction: column;
    gap: 8px;
  }

  /* 编辑/删除按钮全宽（也会影响到类名为 .small 的其他按钮，但仅在此 media query 下） */
  .entry-actions .small {
    width: 100%;
    box-sizing: border-box;
    justify-content: center;
  }
}
</style>
