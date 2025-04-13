<script setup>
import {nextTick, onMounted, onUnmounted, ref, reactive} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {getArticleByID, getArticleByPwd} from "@/api/ArticleService.js";
import {ElNotification} from "element-plus";
import {fetchWallpaper} from "@/api/WallpaperService.js";
import {Clock, Close, EditPen, Postcard, User, View, Menu} from "@element-plus/icons-vue";
import {marked} from "marked";
import katex from "katex";
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/atom-one-light.css';
import hljs from "highlight.js";
import {useAuthStore} from "@/stores/auth.js";
import {isAuthor} from "@/api/UserService.js";
import {useDraggable} from "@/api/useTouchScroll.js";
import {formatDate} from "../api/globals.js";
import Bookmark from "@/components/Bookmark.vue";
import {throttle} from 'lodash-es';

// 响应式数据
const articlesLoading = ref(false);
const route = useRoute();
const article = ref({});
const dialogVisible = ref(false);
const pwd = ref('');
const bookmarkStatus = ref(false);
const selection = ref('');
const isPhone = ref(true);
const wallpaperUrl = ref('');
const htmlContent = ref('');
const tocItems = ref([]);
const activeHeading = ref('');
const scrollProgress = ref(0);
const tocVisible = ref(false);
const dragPosition = reactive({ x: 20, y: 100 });
const isDragging = ref(false);
const startPos = reactive({ x: 0, y: 0 });

const router = useRouter();
const auth = useAuthStore();
const articleListRef = ref(null);
const { calculateMaxScroll, bindTouchEvents, unbindTouchEvents } = useDraggable(articleListRef);

// 方法定义
const getArticle = async () => {
  articlesLoading.value = true;
  const id = route.params.id;
  let res = await getArticleByID(id, auth.token);
  if (res.data.code !== 200) {
    ElNotification({ title: '错误', message: res.data.msg, type: 'error' });
    dialogVisible.value = true;
  } else {
    article.value = res.data.data;
    await getMarkdownContent();
    articlesLoading.value = false;
  }
};

const submitPwd = async () => {
  const id = route.params.id;
  let res = await getArticleByPwd(id, pwd.value);
  if (res.data.code === 200) {
    article.value = res.data.data;
    await getMarkdownContent();
    articlesLoading.value = false;
    dialogVisible.value = false;
  } else {
    ElNotification({ title: '错误', message: res.data.msg, type: 'error' });
  }
};

const onCopy = async () => {
  selection.value = await navigator.clipboard.readText();
  bookmarkStatus.value = true;
};

const checkDeviceType = () => {
  isPhone.value = window.innerWidth <= 768;
};

const getMarkdownContent = async () => {
  const renderer = new marked.Renderer();
  renderer.image = ({ href, title, text }) => {
    return `<img src="${href}" alt="${text}" title="${title}" style="max-width: 100%; height: auto; display: block; margin: 0 auto;" />`;
  };

  marked.setOptions({
    async: false,
    breaks: true,
    gfm: true,
    pedantic: false,
    silent: false,
    renderer,
  });

  htmlContent.value = marked(article.value.content);
  replaceLatexWithClass();
  await nextTick();
  setTimeout(() => {
    renderLatex();
    hljs.highlightAll();
    generateTOC();
  }, 50);
};

const replaceLatexWithClass = () => {
  const processLatex = (match, latex) => {
    latex = latex.replace(/<br>/g, ' ').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
    return `<span class="${match.startsWith('$$') ? 'math' : 'inline-math'}">${latex}</span>`;
  };

  htmlContent.value = htmlContent.value
      .replace(/\$\$([\s\S]+?)\$\$/g, processLatex)
      .replace(/\$([\s\S]+?)\$/g, processLatex);
};

const renderLatex = () => {
  const render = (elements, displayMode = false) => {
    elements.forEach(element => {
      katex.render(element.textContent, element, { throwOnError: false, displayMode });
    });
  };

  render(document.querySelectorAll('.math'), true);
  render(document.querySelectorAll('.inline-math'));
};

const reFresh = () => {
  bookmarkStatus.value = false;
  getMarkdownContent();
};

const edit = async () => {
  if (dialogVisible.value || !auth.isAuthenticated) {
    if (!auth.isAuthenticated) {
      ElNotification({ title: '未登录', message: '请登录后重试', type: 'error' });
    }
    return;
  }

  const res = await isAuthor(article.value, auth.user.id);
  if (res.data.code === 200) {
    await router.push(`/Edit/${article.value.id}`);
  } else {
    ElNotification({ title: '错误', message: res.data.msg, type: 'error' });
  }
};

// 目录功能
const generateTOC = () => {
  tocItems.value = Array.from(document.querySelectorAll('h2, h3, h4, h5, h6'))
      .map((heading, index) => {
        const id = `heading-${index}`;
        heading.id = id;
        return {
          id,
          text: heading.textContent,
          level: parseInt(heading.tagName.substring(1))
        };
      });
};

const scrollToHeading = (id) => {
  const element = document.getElementById(id);
  element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

// 进度条功能
const calculateProgress = () => {
  const articleContent = document.querySelector('.article-content');
  if (!articleContent) return;

  const { height } = articleContent.getBoundingClientRect();
  const maxScroll = height - window.innerHeight;
  scrollProgress.value = Math.min(100, (window.scrollY / maxScroll) * 100);
};

const handleScroll = throttle(() => {
  calculateProgress();

  const current = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
      .findLast(heading => heading.getBoundingClientRect().top <= 100);

  activeHeading.value = current?.id || '';
}, 100);

// 悬浮球功能
const startDrag = (e) => {
  isDragging.value = true;
  const clientX = e.clientX ?? e.touches[0].clientX;
  const clientY = e.clientY ?? e.touches[0].clientY;
  startPos.x = clientX - dragPosition.x;
  startPos.y = clientY - dragPosition.y;
  e.preventDefault();
};
// 修改悬浮球触摸事件处理
const handleFloatMouseDown = (e) => {
  // 只在点击小球本身时触发拖动
  if (e.target.closest('.toc-ball')) {
    startDrag(e);
  }
};

const handleFloatTouchStart = (e) => {
  // 只在点击小球本身时触发拖动
  if (e.target.closest('.toc-ball')) {
    startDrag(e);
  } else {
    // 否则阻止事件冒泡，避免干扰滚动
    e.stopPropagation();
  }
};


const onDrag = (e) => {
  if (!isDragging.value) return;
  const clientX = e.clientX ?? e.touches[0].clientX;
  const clientY = e.clientY ?? e.touches[0].clientY;

  // 限制在屏幕范围内
  const maxX = window.innerWidth - 50;
  const maxY = window.innerHeight - 50;

  dragPosition.x = Math.max(0, Math.min(clientX - startPos.x, maxX));
  dragPosition.y = Math.max(0, Math.min(clientY - startPos.y, maxY));
};

const endDrag = () => {
  isDragging.value = false;
};

const toggleToc = (e) => {
  // 阻止事件冒泡，避免触发拖动
  // console.log("12313")
  e.stopPropagation();
  tocVisible.value = !tocVisible.value;
};

// 生命周期
onMounted(() => {
  getArticle();
  fetchWallpaper(wallpaperUrl);
  checkDeviceType();
  calculateMaxScroll();
  bindTouchEvents();

  document.addEventListener("copy", onCopy);
  window.addEventListener('resize', calculateMaxScroll);
  window.addEventListener('resize', checkDeviceType);
  window.addEventListener('scroll', handleScroll);
  window.addEventListener('mousemove', onDrag);
  window.addEventListener('mouseup', endDrag);
  window.addEventListener('touchmove', onDrag);
  window.addEventListener('touchend', endDrag);
});

onUnmounted(() => {
  unbindTouchEvents();
  document.removeEventListener("copy", onCopy);
  window.removeEventListener('resize', checkDeviceType);
  window.removeEventListener('scroll', handleScroll);
  window.removeEventListener('mousemove', onDrag);
  window.removeEventListener('mouseup', endDrag);
  window.removeEventListener('touchmove', onDrag);
  window.removeEventListener('touchend', endDrag);
});
</script>

<template>
  <div v-if="bookmarkStatus">
    <h3 class="preview-container" @click="reFresh">书签预览(点我关闭)</h3>
    <bookmark :article="article" :selection="selection" />
  </div>
  <div v-else>
    <div class="home">
      <!-- 顶部轮换壁纸 -->
      <div @click="edit" class="header" :style="{ backgroundImage: `url(${wallpaperUrl})` }">
        <h2>{{ article.title }}</h2>
        <div v-if="!dialogVisible" class="article-meta">
          <div class="meta-item">
            <el-icon><Postcard /></el-icon>
            {{ article.categoryName }}
          </div>
          <div class="meta-item">
            <el-icon><View /></el-icon>
            {{ article.viewCount }}
          </div>
          <div class="meta-item">
            <el-icon><User /></el-icon>
            {{ article.authorName }}
          </div>
          <div class="meta-item">
            <el-icon><EditPen /></el-icon>
            {{ formatDate(article.createdAt) }}
          </div>
          <div class="meta-item">
            <el-icon><Clock /></el-icon>
            {{ formatDate(article.publishedAt) }}
          </div>
        </div>
        <div v-else class="dialog">
          <el-dialog v-model="dialogVisible" title="文章被上锁" width="300" :show-close="false" :modal="false"
                     :close-on-click-modal="false" :close-on-press-escape="false">
            <el-form-item label="阅读密码">
              <el-input v-model="pwd" />
            </el-form-item>
            <template #footer>
              <div class="dialog-footer">
                <el-button @click="router.back()">取消</el-button>
                <el-button type="primary" @click="submitPwd">确认</el-button>
              </div>
            </template>
          </el-dialog>
        </div>
      </div>

      <!-- 阅读进度条 -->
      <div class="progress-container" v-if="!dialogVisible">
        <div class="progress-bar" :style="{ width: `${scrollProgress}%` }" />
      </div>

      <!-- 悬浮球目录 -->
      <div class="toc-float"
           :style="{ left: `${dragPosition.x}px`, top: `${dragPosition.y}px` }"
           @mousedown="handleFloatMouseDown"
           @touchstart.passive="handleFloatTouchStart">
        <div class="toc-ball" @click="toggleToc" @touch="toggleToc">
          <el-icon><Menu /></el-icon>
        </div>

        <transition name="toc-slide">
          <div v-show="tocVisible" class="toc-panel">
            <div class="toc-header">
              目录
            </div>
            <div class="toc-content">  <!-- 新增滚动容器 -->
              <div v-for="item in tocItems" :key="item.id" class="toc-item"
                   :style="{ paddingLeft: `${(item.level - 1) * 12}px` }"
                   :class="{ active: item.id === activeHeading }"
                   @click="scrollToHeading(item.id); tocVisible = false"
                   @touch="scrollToHeading(item.id); tocVisible = false">
                {{ item.text }}
              </div>
            </div>
          </div>
        </transition>
      </div>

      <!-- 文章内容 -->
      <div class="article-list" ref="articleListRef">
        <el-skeleton :rows="20" animated v-if="articlesLoading" />
        <div class="article-card" v-else>
          <div class="article-content" v-html="htmlContent" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 基础布局 */
.home {
  display: flex;
  flex-direction: column;
}

/* 头部样式 */
.header {
  background: center/cover no-repeat;
  height: 150px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  border-radius: 25px;
  position: relative;
  overflow: hidden;
}

/* 元数据样式 */
.article-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.meta-item {
  display: flex;
  align-items: center;
  margin: 0 4px;
  gap: 4px;
  font-size: 1.0em;
}

/* 文章内容区域 */
.article-list {
  flex: 1;
  padding: 8px;
  margin-top: 24px;
}

.article-card {
  width: 100%; /* 使文章卡片宽度为 100% */
  display: flex;
  flex-direction: column;
  border-radius: 25px;
  overflow: hidden;
  margin-bottom: 25px; /* 卡片之间的间距 */
  background-color: #FFFFFE; /* 白色背景 */
  box-shadow: 0 15px 20px rgba(0, 0, 0, 0.1); /* 细微阴影 */
  transition: transform 0.1s ease, box-shadow 0.1s ease; /* 动画效果 */
}
/* 为电脑屏幕设置宽度为75% */
@media (min-width: 768px) { /* 768px 是一个常见的平板/电脑分界点 */
  .article-card {
    max-width: 75%;
    margin: 0 auto; /* 居中显示 */
  }
}

.article-content {
  padding: 20px;
  min-height: calc(100vh - 200px);
}

/* 进度条 */
.progress-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: rgba(255, 255, 255, 0.3);
  z-index: 1000;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #ff8a00, #e52e71);
  transition: width 0.1s;
}

/* 悬浮球目录 */
.toc-float {
  position: fixed;
  z-index: 1000;
  transition: transform 0.2s ease;
  touch-action: none;
}

.toc-ball {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(90deg, #ff8a00, #e52e71);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  transition: all 0.3s;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.toc-ball:hover {
  transform: scale(1.1);
}
/* 目录面板样式 */
.toc-panel {
  position: absolute;
  top: 60px;
  width: 275px;
  height: 50vh;
  background: #FFFFFE;
  border-radius: 25px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden; /* 隐藏内部溢出 */
  display: flex;
  flex-direction: column;
  z-index: 1001;
}

/* 目录内容区域（可滚动） */
.toc-content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch; /* 启用平滑滚动（iOS） */
  padding: 0 15px 15px;
  max-height: calc(70vh - 50px); /* 减去标题高度 */
}

/* 目录标题样式 */
.toc-header {
  padding: 15px;
  font-weight: bold;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  background: #FFFFFE;
  z-index: 1;
}

/* 目录项样式 */
.toc-item {
  padding: 10px 0;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  line-height: 1.4;
  transition: all 0.3s;
}

.toc-item:hover, .toc-item.active {
  color: #409eff;
}

.toc-item.active {
  font-weight: bold;
}

/* 自定义滚动条 */
.toc-content::-webkit-scrollbar {
  width: 0px;
}

.toc-content::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}

.toc-content::-webkit-scrollbar-track {
  background: transparent;
}
.toc-float {
  touch-action: none; /* 保持拖动能力 */
}

.toc-content {
  touch-action: pan-y; /* 允许垂直滚动 */
  overscroll-behavior: contain; /* 防止滚动链 */
}

.preview-container {
  margin-top: 20px;
  text-align: center;
}
</style>