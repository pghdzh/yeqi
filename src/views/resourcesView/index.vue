<template>
    <div class="yuzuki-resources">
        <header class="hero">
            <div class="hero-inner">
                <h1>楪祈的资源库</h1>
                <p class="subtitle">访客可自由上传网盘（百度 / 夸克）链接</p>
            </div>
        </header>

        <main class="container">
            <section class="uploader" :class="{ collapsed: uploaderCollapsed }">
                <div class="uploader-head">
                    <button class="toggle" @click="toggleUploader" :aria-expanded="!uploaderCollapsed">
                        <span v-if="uploaderCollapsed">展开上传区</span>
                        <span v-else>收起上传区</span>
                    </button>
                </div>

                <form @submit.prevent="addResource" class="upload-form" :aria-hidden="uploaderCollapsed">
                    <div class="row">
                        <input v-model="form.title" type="text" placeholder="资源标题（必填）" aria-label="资源标题" />
                        <select v-model="form.type" aria-label="网盘类型">
                            <option value="baidu">百度网盘</option>
                            <option value="quark">夸克网盘</option>
                        </select>
                    </div>

                    <div class="row">
                        <input v-model="form.uploader" type="text" placeholder="上传人（可选）" aria-label="上传人" />
                        <input v-model="form.link" type="url" placeholder="网盘链接(请选择好对应网盘)" aria-label="网盘链接" />
                    </div>

                    <div class="actions">
                        <button type="submit" class="btn primary">上传资源</button>
                    </div>
                </form>
            </section>

            <section class="list">
                <div class="list-header">
                    <h2>资源列表（{{ resources.length }}）</h2>
                    <div class="sort">
                        <label>
                            排序：
                            <select v-model="sortBy">
                                <option value="time">按时间（新→旧）</option>
                                <option value="likes">按点赞（高→低）</option>
                            </select>
                        </label>
                    </div>
                </div>

                <ul class="items">
                    <li v-for="item in sortedResources" :key="item.id" class="item">
                        <a :href="item.link" target="_blank" rel="noopener noreferrer" class="title">{{ item.title
                            }}</a>

                        <div class="meta">
                            <div class="left">
                                <span class="uploader">{{ item.uploader || '匿名' }}</span>
                                <span class="dot">•</span>
                                <time :datetime="item.time">{{ formatTime(item.time) }}</time>
                            </div>

                            <div class="right">
                                <button @click.prevent="handleLike(item)" :aria-pressed="likedIds.has(String(item.id))"
                                    class="like-btn" :class="{ active: likedIds.has(String(item.id)) }">

                                    <img :src="likedIds.has(String(item.id))
                                        ? '/icons/heart-red-filled.svg'
                                        : '/icons/heart-red-outline.svg'" class="heart-icon" alt="heart" />
                                    <span class="count">{{ item.likes }}</span>
                                </button>


                                <span class="badge" :class="item.type">{{ item.type === 'baidu' ? '百度' : '夸克' }}</span>
                            </div>
                        </div>
                    </li>
                </ul>

                <p v-if="resources.length === 0" class="empty">目前没有资源，快来上传第一条吧！</p>
            </section>
        </main>

        <footer class="foot">提示：点击标题将直接跳转到网盘链接</footer>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
// 如果你的工程使用 ts 路径别名 @ 指向 src，可以用 '@/api/resource'，否则根据实际路径调整
import { getResourceList, createResource, likeResource } from '@/api/modules/resource'
import { ElMessage } from 'element-plus'
type ResourceType = 'baidu' | 'quark'
interface Resource {
    id: number | string
    title: string
    uploader?: string
    time: string // ISO 或 created_at
    likes: number
    link: string
    type: ResourceType
    role_key?: string
}

const STORAGE_KEY = 'yuzuki_resources_v1'
const DEFAULT_ROLE = 'yeqi'

const form = ref<{ title: string; uploader: string; link: string; type: ResourceType }>({
    title: '',
    uploader: '',
    link: '',
    type: 'baidu',
})

const resources = ref<Resource[]>([])
const likedIds = ref(new Set<string>())
const sortBy = ref<'time' | 'likes'>('time')
const uploaderCollapsed = ref(false)

function mapServerToLocal(row: any): Resource {

    return {
        id: row.id,
        title: row.title,
        uploader: row.uploader || '匿名',
        time: row.created_at || row.time || new Date().toISOString(),
        likes: row.likes ?? 0,
        link: row.link,
        type: (row.storage_type || row.type || 'other') as ResourceType,
        role_key: row.role_key,
    }
}



async function loadResources() {
    try {
        // 尝试从后端拉取（分页可扩展，这里一次拉足够 demo）
        const res: any = await getResourceList({ role_key: DEFAULT_ROLE, page: 1, pageSize: 100 })
        if (res && res.success && Array.isArray(res.data)) {
            resources.value = res.data.map(mapServerToLocal)
            // 可恢复本地点赞状态（仅 UI 记忆）
            const raw = localStorage.getItem(STORAGE_KEY)
            if (raw) {
                try {
                    const parsed = JSON.parse(raw)
                    if (parsed.liked && Array.isArray(parsed.liked)) {
                        parsed.liked.forEach((id: string) => likedIds.value.add(id))
                    }
                } catch (e) { /* ignore */ }
            }
            return
        }
    } catch (err) {
        console.warn('拉取资源失败，使用本地缓存', err)
    }
    // 回退：本地缓存（仅恢复点赞状态）
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) {
            const parsed = JSON.parse(raw)
            if (parsed.liked && Array.isArray(parsed.liked)) {
                parsed.liked.forEach((id: string) => likedIds.value.add(id))
            }
        }
    } catch (e) {
        console.warn('本地加载失败', e)
    }
}

function saveLocalCache() {
    try {
        const liked = Array.from(likedIds.value)
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ liked }))
    } catch (e) {
        console.warn('保存本地缓存失败', e)
    }
}

onMounted(() => {
    loadResources()
    // 移动端默认收起上传区以节省空间
    uploaderCollapsed.value = window.innerWidth <= 640
})
function toggleUploader() {
    uploaderCollapsed.value = !uploaderCollapsed.value
}

function validLinkForType(link: string, type: ResourceType) {
    try {
        const u = new URL(link)
        const host = u.host.toLowerCase()
        if (type === 'baidu') return host.includes('pan.baidu.com')
        if (type === 'quark') return host.includes('quark.cn')
        return !!host
    } catch (e) {
        return false
    }
}

async function addResource() {
    const t = form.value.title.trim()
    const l = form.value.link.trim()
    if (!form.value.title.trim() || !form.value.link.trim()) {
        return ElMessage.warning('请填写完整信息')
    }
    if (!/^https?:\/\//i.test(l)) {
        return ElMessage.error('请输入正确的链接')
    }
    if (!validLinkForType(l, form.value.type)) {
        return ElMessage.error('仅支持百度网盘或夸克链接')
    }

    // 尝试调用后端接口
    try {
        const payload = {
            title: t,
            uploader: form.value.uploader.trim() || '匿名',
            link: l,
            storage_type: form.value.type,
            role_key: DEFAULT_ROLE,
        }
        const res: any = await createResource(payload)
        if (res && res.success && res.data) {
            const added = mapServerToLocal(res.data)
            resources.value.unshift(added)
            // 自动展开到顶部展示（可选）
            saveLocalCache()
            resetForm()
            ElMessage.success('上传成功')
            return
        }
        ElMessage.error('上传失败')
    } catch (err) {
        console.warn('创建资源失败', err)
    }
}

function resetForm() {
    form.value.title = ''
    form.value.uploader = ''
    form.value.link = ''
    form.value.type = 'baidu'
}

async function handleLike(item: Resource) {
    // UI 乐观更新
    const id = item.id
    const wasLiked = likedIds.value.has(String(id))
    if (wasLiked) {
        likedIds.value.delete(String(id))
        item.likes = Math.max(0, item.likes - 1)
    } else {
        likedIds.value.add(String(id))
        item.likes++
    }
    saveLocalCache()

    // 同步后端（不依赖返回值进行 UI 回滚，简单处理：若失败则回退）
    try {
        const action = wasLiked ? 'unlike' : 'like'
        const res: any = await likeResource(id, action)
        if (res && res.success && res.data && typeof res.data.likes !== 'undefined') {
            item.likes = res.data.likes
        }
    } catch (err) {
        console.warn('点赞接口调用失败，回滚本地状态', err)
        // 回滚
        if (wasLiked) {
            // 本来是已赞，取消失败 -> 重新添加
            likedIds.value.add(String(id))
            item.likes++
        } else {
            likedIds.value.delete(String(id))
            item.likes = Math.max(0, item.likes - 1)
        }
        saveLocalCache()
    }
}

const sortedResources = computed(() => {
    const arr = [...resources.value]
    if (sortBy.value === 'time') {
        arr.sort((a, b) => +new Date(b.time) - +new Date(a.time))
    } else {
        arr.sort((a, b) => b.likes - a.likes)
    }
    return arr
})

function formatTime(iso: string) {
    try {
        const d = new Date(iso)
        return new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(d)
    } catch (e) {
        return iso
    }
}
</script>

<style lang="scss" scoped>
$bg1: linear-gradient(135deg, #fff6fb 0%, #f6fbff 100%);
$accent: #b983ff; // 甜美的紫色
$accent-2: #ffb3d9; // 粉色
$text: #3b2f36;
$muted: #8b7e87;

.yuzuki-resources {
    min-height: 100vh;
    background: $bg1;
    color: $text;
    display: flex;
    flex-direction: column;
    padding-top: 70px;

    .hero {
        padding: 16px;
        background: linear-gradient(180deg, rgba(185, 131, 255, 0.12), rgba(255, 179, 217, 0.06));

        .hero-inner {
            max-width: 1000px;
            margin: 0 auto;

            h1 {
                margin: 0;
                font-size: 20px;
                letter-spacing: 0.6px;
            }

            .subtitle {
                margin-top: 6px;
                color: $muted;
                font-size: 13px;
            }
        }
    }

    .container {
        max-width: 1000px;
        margin: 16px auto;
        padding: 0 12px;
        width: 100%;

        .uploader {
            background: rgba(255, 255, 255, 0.7);
            border-radius: 12px;
            padding: 0; // padding moved into .upload-form
            box-shadow: 0 6px 18px rgba(96, 72, 120, 0.06);

            .uploader-head {
                display: flex;
                justify-content: flex-end;
                padding: 10px 12px;

                .toggle {
                    background: transparent;
                    border: none;
                    padding: 6px 10px;
                    border-radius: 8px;
                    cursor: pointer;
                    color: $accent;
                    font-weight: 700;
                }
            }

            .upload-form {
                padding: 12px;
                max-height: 1600px;
                overflow: hidden;
                transition: max-height 280ms ease, padding 280ms ease;

                &.hidden {
                    display: none;
                }

                .row {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 8px;

                    input,
                    select {
                        flex: 1 1 0;
                        padding: 10px 12px;
                        border-radius: 10px;
                        border: 1px solid rgba(59, 47, 54, 0.06);
                        font-size: 14px;
                        background: rgba(255, 255, 255, 0.9);
                    }

                    select {
                        max-width: 120px;
                    }
                }

                .actions {
                    display: flex;
                    gap: 8px;
                    align-items: center;

                    .btn {
                        padding: 8px 12px;
                        border-radius: 10px;
                        border: none;
                        font-weight: 600;
                        cursor: pointer;

                        &.primary {
                            background: $accent;
                            color: white;
                        }

                        &.secondary {
                            background: rgba(59, 47, 54, 0.06);
                            color: $text;
                        }
                    }
                }


            }

            /* 收起状态 */
            &.collapsed {
                .upload-form {
                    max-height: 0;
                    padding-top: 0;
                    padding-bottom: 0;
                }
            }
        }

        .list {
            margin-top: 14px;

            .list-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;

                h2 {
                    font-size: 16px;
                    margin: 0;
                }

                .sort select {
                    padding: 6px;
                    border-radius: 8px;
                }
            }

            .items {
                list-style: none;
                padding: 0;
                margin: 0;

                .item {
                    background: white;
                    border-radius: 12px;
                    padding: 12px;
                    margin-bottom: 10px;
                    box-shadow: 0 8px 20px rgba(95, 64, 120, 0.04);

                    .title {
                        display: block;
                        color: $text;
                        font-weight: 700;
                        text-decoration: none;
                        margin-bottom: 8px;
                        font-size: 15px;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }

                    .meta {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        color: $muted;
                        font-size: 13px;

                        .left {
                            display: flex;
                            align-items: center;
                            gap: 6px;
                        }

                        .dot {
                            opacity: 0.6
                        }

                        .right {
                            display: flex;
                            align-items: center;
                            gap: 8px;

                            .like-btn,
                            .copy-btn {
                                background: transparent;
                                border: none;
                                cursor: pointer;
                                padding: 6px 8px;
                                border-radius: 8px;
                                font-weight: 600;
                                display: inline-flex;
                                align-items: center;
                                gap: 6px;
                            }

                            .heart-icon {
                                width: 18px;
                                height: 18px;
                                display: block;
                            }


                            .copy-btn {
                                color: $muted
                            }

                            .badge {
                                padding: 4px 8px;
                                border-radius: 999px;
                                font-size: 12px;
                                font-weight: 700;

                                &.baidu {
                                    background: rgba(185, 131, 255, 0.12);
                                }

                                &.quark {
                                    background: rgba(255, 179, 217, 0.12);
                                }

                                &.other {
                                    background: rgba(188, 187, 189, 0.12);
                                }
                            }
                        }
                    }
                }
            }

            .empty {
                text-align: center;
                color: $muted;
                padding: 24px 0;
            }
        }
    }

    .foot {
        text-align: center;
        color: $muted;
        font-size: 12px;
        margin: 16px 0 40px;
    }
}

/* responsive */
@media (max-width: 640px) {
    .yuzuki-resources {
        .container {
            padding: 0 14px;

            .upload-form {
                .row {
                    flex-direction: column;
                }

                .actions {
                    flex-direction: column;
                    align-items: stretch;
                }
            }

            .items .item .title {
                white-space: normal;
            }
        }
    }
}
</style>