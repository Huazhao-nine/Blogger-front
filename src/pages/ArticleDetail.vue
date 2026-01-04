<script setup>
import { nextTick, onMounted, onUnmounted, ref, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getArticleByID, getArticleByPwd } from '@/api/ArticleService.js';
import { fetchWallpaper } from '@/api/WallpaperService.js';
import { marked } from 'marked';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/atom-one-light.css';
import { useAuthStore } from '@/stores/auth.js';
import { isAuthor } from '@/api/UserService.js';
import { useDraggable } from '@/api/useTouchScroll.js';
import { formatDate } from '../api/globals.js';
import Bookmark from '@/components/Bookmark.vue';
import { throttle } from 'lodash-es';
import '@/assets/phycat-prussian.css';
import { useIntersectionObserver } from '@vueuse/core';
import {Clock, EditPen, Postcard, Reading, User, View} from "@element-plus/icons-vue";
// ✅ 救星：按需引入，体积减小 80%
import hljs from 'highlight.js/lib/core';
import javascript from "highlight.js/lib/languages/javascript";
import java from "highlight.js/lib/languages/java";
import sql from "highlight.js/lib/languages/sql";
// ...只引入你常用的几种

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('java', java);
hljs.registerLanguage('sql', sql);

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

const articleCache = new Map();

let cachedHeadings = [];
let cachedArticleContent = null;

function batchRender(elements, renderFn, batchSize = 5) {
  const queue = [...elements];
  const loop = () => {
    const batch = queue.splice(0, batchSize);
    batch.forEach(el => renderFn(el));
    if (queue.length) requestIdleCallback(loop);
  };
  loop();
}

const chunkedParseMarkdown = async (markdown) => {
  const chunkSize = isPhone.value ? 3000 : 5000;
  let html = '';
  for (let i = 0; i < markdown.length; i += chunkSize) {
    const chunk = markdown.slice(i, i + chunkSize);
    html += marked.parse(chunk);
    await nextTick();
  }
  return html;
};

const getMarkdownContent = async () => {
  if (articleCache.has(article.value.id)) {
    htmlContent.value = articleCache.get(article.value.id);
    const renderEnhancers = throttle(() => {
      observeLatexElements();
      const codeBlocks = document.querySelectorAll('pre code');
      batchRender(codeBlocks, el => hljs.highlightElement(el));
      generateTOC();
    }, 300);
    renderEnhancers();
    return;
  }

  const rawContent = article.value.content;
  const latexMap = new Map();
  let index = 0;
  const latexProtected = rawContent
      .replace(/\$\$([\s\S]+?)\$\$/g, (_, latex) => {
        const key = `{{LATEX_BLOCK_${index++}}}`;
        latexMap.set(key, { latex, display: true });
        return key;
      })
      .replace(/\$([^\$]+?)\$/g, (_, latex) => {
        const key = `{{LATEX_INLINE_${index++}}}`;
        latexMap.set(key, { latex, display: false });
        return key;
      });

  const renderer = new marked.Renderer();
  renderer.image = ({ href, title, text }) => {
    return `<img src="${href}" alt="${text}" title="${title}" style="max-width: 100%; height: auto; display: block; margin: 0 auto;" loading="lazy" />`;
  };
  marked.use({
    extensions: [{
      name: 'highlight',
      level: 'inline',
      start(src) { return src.indexOf('=='); },
      tokenizer(src) {
        const match = /^==([\s\S]+?)==/.exec(src);
        if (match) return { type: 'highlight', raw: match[0], text: match[1] };
      },
      renderer(token) { return `<mark>${token.text}</mark>`; }
    }]
  });
  marked.setOptions({ async: false, breaks: true, gfm: true, renderer });

  let html = await chunkedParseMarkdown(latexProtected);
  for (const [key, { latex, display }] of latexMap.entries()) {
    const span = `<span class="${display ? 'math' : 'inline-math'}">${latex}</span>`;
    html = html.split(key).join(span);
  }

  articleCache.set(article.value.id, html);
  htmlContent.value = html;

  await nextTick();
  requestAnimationFrame(() => {
    observeLatexElements();
    const codeBlocks = document.querySelectorAll('pre code');
    batchRender(codeBlocks, el => hljs.highlightElement(el));
    generateTOC();
  });
};

const observeLatexElements = () => {
  const elements = document.querySelectorAll('.math, .inline-math');
  batchRender(elements, (el) => {
    useIntersectionObserver(
        el,
        ([{ isIntersecting }]) => {
          if (isIntersecting && !el.dataset.rendered) {
            try {
              const latex = el.innerText;
              katex.render(latex, el, {
                throwOnError: false,
                displayMode: el.classList.contains('math'),
                trust: true,
              });
              el.dataset.rendered = 'true';
            } catch (e) {
              el.innerHTML = `<span style="color: red;">KaTeX Error: ${e.message}</span>`;
            }
          }
        },
        { threshold: 0.1 }
    );
  });
};

const getArticle = async () => {
  articlesLoading.value = true;
  console.log(route.params)
  const id = route.params.id;
  const res = await getArticleByID(id, auth.token);
  console.log(res)
  if (res.code !== 200) {
    ElNotification({ title: '错误', message: res.msg, type: 'error' });
    dialogVisible.value = true;
  } else {
    article.value = res.data;
    await getMarkdownContent();
    articlesLoading.value = false;
  }
};

const submitPwd = async () => {
  const id = route.params.id;
  const res = await getArticleByPwd(id, pwd.value);
  if (res.code === 200) {
    article.value = res.data;
    await getMarkdownContent();
    articlesLoading.value = false;
    dialogVisible.value = false;
  } else {
    ElNotification({ title: '错误', message: res.msg, type: 'error' });
  }
};

const onCopy = async () => {
  selection.value = await navigator.clipboard.readText();
  bookmarkStatus.value = true;
};

const checkDeviceType = () => {
  isPhone.value = window.innerWidth <= 768;
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
  if (res.code === 200) {
    await router.push(`/Edit/${article.value.id}`);
  } else {
    ElNotification({ title: '错误', message: res.msg, type: 'error' });
  }
};

const generateTOC = () => {
  cachedArticleContent = document.querySelector('.article-content');
  cachedHeadings = Array.from(cachedArticleContent.querySelectorAll('h2, h3, h4, h5, h6'));

  const toc = [];
  let currentH2 = null;

  cachedHeadings.forEach((heading, index) => {
    const id = `heading-${index}`;
    heading.id = id;
    const level = parseInt(heading.tagName.substring(1));
    const item = { id, text: heading.textContent, level, children: [], open: false };
    if (level === 2) {
      currentH2 = item;
      toc.push(currentH2);
    } else if (currentH2) {
      currentH2.children.push(item);
    }
  });

  tocItems.value = toc;
};

const scrollToHeading = (id) => {
  const element = document.getElementById(id);
  if (element) {
    const top = element.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: 'smooth' });
  }
};

const expandTocForHeading = (headingId) => {
  tocItems.value.forEach(item => {
    if (item.id === headingId || item.children.some(child => child.id === headingId)) {
      item.expanded = true;
    } else {
      item.expanded = false;
    }
  });
};

const calculateProgress = () => {
  const articleContent = document.querySelector('.article-content');
  if (!articleContent) return;
  const maxScroll = articleContent.scrollHeight - window.innerHeight;
  scrollProgress.value = Math.min(100, (window.scrollY / maxScroll) * 100);
};

let ticking = false;
const handleScroll = () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      calculateProgress();
      let nearest = null;
      let minDistance = Infinity;
      cachedHeadings.forEach(heading => {
        const distance = Math.abs(heading.getBoundingClientRect().top - 80);
        if (distance < minDistance) {
          minDistance = distance;
          nearest = heading;
        }
      });
      if (nearest) {
        activeHeading.value = nearest.id;
        expandTocForHeading(nearest.id);
      }
      ticking = false;
    });
    ticking = true;
  }
};

const startDrag = (e) => {
  isDragging.value = true;
  const clientX = e.clientX ?? e.touches[0].clientX;
  const clientY = e.clientY ?? e.touches[0].clientY;
  startPos.x = clientX - dragPosition.x;
  startPos.y = clientY - dragPosition.y;
  e.preventDefault();
};

const handleFloatMouseDown = (e) => {
  if (e.target.closest('.toc-ball')) startDrag(e);
};

const handleFloatTouchStart = (e) => {
  if (e.target.closest('.toc-ball')) startDrag(e);
  else e.stopPropagation();
};

const onDrag = (e) => {
  if (!isDragging.value) return;
  const clientX = e.clientX ?? e.touches[0].clientX;
  const clientY = e.clientY ?? e.touches[0].clientY;
  const maxX = window.innerWidth - 50;
  const maxY = window.innerHeight - 50;
  dragPosition.x = Math.max(0, Math.min(clientX - startPos.x, maxX));
  dragPosition.y = Math.max(0, Math.min(clientY - startPos.y, maxY));
};

const endDrag = () => {
  isDragging.value = false;
};

const toggleToc = (e) => {
  e.stopPropagation();
  tocVisible.value = !tocVisible.value;
};

onMounted(() => {
  getArticle();
  fetchWallpaper(wallpaperUrl);
  checkDeviceType();
  calculateMaxScroll();
  bindTouchEvents();
  document.addEventListener('copy', onCopy);
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
  document.removeEventListener('copy', onCopy);
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
    <Bookmark :article="article" :selection="selection" />
  </div>
  <div v-else>
    <div class="home">

      <!-- 顶部壁纸区域 -->
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
      <el-backtop :visibility-height="200" :right="20" :bottom="80" />


      <!-- 悬浮目录按钮+面板 -->
      <div class="toc-float"
           :style="{ left: `${dragPosition.x}px`, top: `${dragPosition.y}px` }"
           @mousedown="handleFloatMouseDown"
           @touchstart.passive="handleFloatTouchStart">
        <div class="toc-ball" @click="toggleToc" @touch="toggleToc">
          <el-icon><Reading /></el-icon>
        </div>

        <transition name="toc-slide">
          <div v-show="tocVisible" class="toc-panel">
            <div class="toc-header">目录</div>
            <div class="toc-content">
              <div v-for="item in tocItems" :key="item.id">
                <!-- 一级标题 -->
                <div class="toc-item toc-h2"
                     :class="{ active: item.id === activeHeading }"
                     @click="() => { scrollToHeading(item.id); item.expanded = !item.expanded }">
                  <el-icon style="margin-right: 4px;">
                    <span v-if="item.children.length">{{ item.expanded ? '▼' : '▶' }}</span>
                  </el-icon>
                  {{ item.text }}
                </div>

                <!-- 子标题 -->
                <transition-group name="fade" tag="div">
                  <div v-for="child in item.children" :key="child.id"
                       v-show="item.expanded"
                       class="toc-item"
                       :style="{ paddingLeft: `${(child.level - 1) * 12}px` }"
                       :class="{ active: child.id === activeHeading }"
                       @click="scrollToHeading(child.id)">
                    {{ child.text }}
                  </div>
                </transition-group>
              </div>
            </div>
          </div>
        </transition>
      </div>

      <!-- 正文内容区域 -->
      <div class="article-list" ref="articleListRef">
        <el-skeleton :rows="3" animated v-if="articlesLoading" />
        <div class="article-card" v-else>
          <div id="write" class="article-content" v-html="htmlContent" />
          <!-- 版权声明 -->
          <div class="copyright-tip">
            © Copyright by 花朝九日
          </div>
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

/* 顶部壁纸 */
.header {
  background: center/cover no-repeat;
  height: 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  border-radius: 25px;
  overflow: hidden;
}

/* 元数据 */
.article-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  margin: 2px 6px;
  font-size: 0.95rem;
  color: #eee;
}

/* 文章列表 */
.article-list {
  flex: 1;
  padding: 8px;
  margin-top: 20px;
}

.article-card {
  width: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: 25px;
  background-color: #fcfcfb;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s, box-shadow 0.2s;
}

@media (min-width: 768px) {
  .article-card {
    max-width: 75%;
    margin: 0 auto;
  }
}

/* 文章内容 */
.article-content {
  padding: 24px;
  color: #333;
  font-size: 16px;
  line-height: 1.8;
  background: #fcfcfb;
  overscroll-behavior: contain;
}

/* 标题层级优化 */
.article-content h2 {
  font-size: 1.6em;
  margin: 1.5em 0 0.7em;
  font-weight: bold;
  border-left: 4px solid #fbcf4b;
  padding-left: 10px;
  color: #222;
}

.article-content h3 {
  font-size: 1.4em;
  margin: 1.2em 0 0.6em;
  font-weight: 600;
  color: #333;
}

.article-content h4, h5, h6 {
  font-size: 1.2em;
  margin: 1em 0 0.5em;
  font-weight: 500;
  color: #444;
}

/* 段落优化 */
.article-content p {
  margin: 1.2em 0;
}

/* 引用块优化 */
.article-content blockquote {
  background: rgba(251, 207, 75, 0.08);
  padding: 12px 18px;
  border-left: 4px solid #fbcf4b;
  color: #555;
  font-style: italic;
}

/* 高亮块优化 */
.article-content mark {
  background: #fff3cd;
  padding: 0 4px;
}

/* 进度条 */
.progress-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: rgba(0, 0, 0, 0.05);
  z-index: 999;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #ff8a00, #e52e71);
  transition: width 0.3s ease-out;
  will-change: width;
}

/* 目录浮动球 */
.toc-float {
  position: fixed;
  z-index: 1000;
  transition: transform 0.2s ease;
  will-change: transform;
  touch-action: none;
}

.toc-ball {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(90deg, #3db8d3, #2c9ab3);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  user-select: none;
}

.toc-ball:hover {
  transform: scale(1.1);
}

/* 目录面板 */
.toc-panel {
  position: absolute;
  top: 60px;
  width: 275px;
  height: 50vh;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 20px;
  backdrop-filter: blur(3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.toc-header {
  padding: 15px;
  font-weight: bold;
  font-size: 18px;
  color: #333;
  border-bottom: 1px solid #eee;
  background: #fcfcfb;
  z-index: 1;
  position: sticky;
  top: 0;
}

/* 目录内容滚动 */
.toc-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 15px;
}

.toc-item {
  padding: 10px 0;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: color 0.3s, background 0.3s;
  border-radius: 25px;

}

.toc-item:hover, .toc-item.active {
  border-radius: 25px;
  color: #3db8d3;
  background: rgba(251, 207, 75, 0.1);
}

.toc-h2 {
  font-weight: bold;
  font-size: 15px;
}

/* 子目录项 */
.toc-item:not(.toc-h2) {
  padding-left: 28px;
}

/* 滚动条优化 */
.toc-content::-webkit-scrollbar {
  width: 0;
}

/* 数学公式渐显 */
.math, .inline-math {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.copyright-tip {
  margin-top: 2rem;
  padding: 1rem;
  font-size: 13px;
  text-align: center;
}

.preview-container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  margin-top: 20px;
  text-align: center;
}
</style>

