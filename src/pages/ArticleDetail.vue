<script setup>
import { nextTick, onMounted, onUnmounted, ref, reactive, computed } from 'vue';
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
import { Clock, EditPen, Postcard, Reading, User, View, Timer } from "@element-plus/icons-vue";
import { ElNotification, ElImageViewer } from 'element-plus';

// 按需引入 highlight.js
import hljs from 'highlight.js/lib/core';
import javascript from "highlight.js/lib/languages/javascript";
import java from "highlight.js/lib/languages/java";
import sql from "highlight.js/lib/languages/sql";
import python from "highlight.js/lib/languages/python";
import bash from "highlight.js/lib/languages/bash";

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('java', java);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('python', python);
hljs.registerLanguage('bash', bash);

// ================== Marked 配置 ==================
const renderer = new marked.Renderer();

renderer.image = ({ href, title, text }) => {
  return `<img src="${href}" alt="${text}" title="${title}" style="max-width: 100%; height: auto; display: block; margin: 0 auto;" loading="lazy" />`;
};

renderer.blockquote = function (quote) {
  let body = quote;
  if (typeof quote !== 'string') {
    body = this.parser.parse(quote.tokens);
  }

  const alertRegex = /^<p>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i;
  const match = body.match(alertRegex);

  if (match) {
    const type = match[1].toLowerCase();
    const title = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
    const content = body.replace(/^<p>\s*\[!.*?\]\s*/i, '<p>');

    return `
      <div class="md-alert md-alert-${type}">
        <p class="md-alert-text-container">${title}</p>
        ${content}
      </div>
    `;
  }
  return `<blockquote>${body}</blockquote>`;
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
// =================================================

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

const showImageViewer = ref(false);
const imagePreviewList = ref([]);
const imageInitialIndex = ref(0);

const router = useRouter();
const auth = useAuthStore();
const articleListRef = ref(null);
const { calculateMaxScroll, bindTouchEvents, unbindTouchEvents } = useDraggable(articleListRef);

const articleCache = new Map();

let cachedHeadings = [];
let cachedArticleContent = null;
const textLength = ref(null)
// 计算预估阅读时间
const readingTime = computed(() => {
  if (!article.value.content) return 0;
  textLength.value = article.value.content.length;
  const wpm = 400;
  const time = Math.ceil(textLength.value / wpm);
  return time < 1 ? 1 : time;
});

function batchRender(elements, renderFn, batchSize = 5) {
  const queue = [...elements];
  const loop = () => {
    const batch = queue.splice(0, batchSize);
    batch.forEach(el => renderFn(el));
    if (queue.length) requestIdleCallback(loop);
  };
  loop();
}

const enhanceCodeBlocks = () => {
  const preElements = document.querySelectorAll('.article-content pre');
  preElements.forEach((pre) => {
    if (pre.parentNode.classList.contains('code-block-wrapper')) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'code-block-wrapper';

    const header = document.createElement('div');
    header.className = 'code-block-header';

    const codeClass = pre.querySelector('code')?.className || '';
    const lang = codeClass.match(/language-(\w+)/)?.[1] || 'TEXT';

    header.innerHTML = `
      <div class="mac-dots">
        <span></span><span></span><span></span>
      </div>
      <span class="lang-label">${lang.toUpperCase()}</span>
      <button class="copy-btn">复制</button>
    `;

    pre.parentNode.insertBefore(wrapper, pre);
    wrapper.appendChild(header);
    wrapper.appendChild(pre);

    const btn = header.querySelector('.copy-btn');
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(pre.innerText);
        btn.textContent = '成功';
        btn.style.color = '#3db8d3';
        setTimeout(() => {
          btn.textContent = '复制';
          btn.style.color = '';
        }, 2000);
      } catch (err) {
        console.error('复制失败', err);
        btn.textContent = '失败';
      }
    });
  });
};

const handleImagePreview = () => {
  const imgs = document.querySelectorAll('.article-content img');
  const srcList = [];
  imgs.forEach((img, index) => {
    srcList.push(img.src);
    img.style.cursor = 'zoom-in';
    img.onclick = () => {
      imagePreviewList.value = srcList;
      imageInitialIndex.value = index;
      showImageViewer.value = true;
    };
  });
};

const wrapTables = () => {
  const tables = document.querySelectorAll('.article-content table');
  tables.forEach(table => {
    if (table.parentNode.classList.contains('table-wrapper')) return;
    const wrapper = document.createElement('div');
    wrapper.className = 'table-wrapper';
    table.parentNode.insertBefore(wrapper, table);
    wrapper.appendChild(table);
  });
};

const getMarkdownContent = async () => {
  if (articleCache.has(article.value.id)) {
    htmlContent.value = articleCache.get(article.value.id);
    const renderEnhancers = throttle(() => {
      observeLatexElements();
      const codeBlocks = document.querySelectorAll('pre code');
      batchRender(codeBlocks, el => hljs.highlightElement(el));
      enhanceCodeBlocks();
      handleImagePreview();
      wrapTables();
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

  let html = marked.parse(latexProtected);

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

    enhanceCodeBlocks();
    handleImagePreview();
    wrapTables();

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
  const id = route.params.id;
  const res = await getArticleByID(id, auth.token);
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
  if (!cachedArticleContent) return;
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
  if(isDragging.value) return;
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
        <div v-if="!dialogVisible" class="read-time-line">
          <el-icon style="margin-right: 4px"><Timer /></el-icon>
          本文共{{textLength}}个字符，预计阅读时间 {{ readingTime }} 分钟
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

      <div class="progress-container" v-if="!dialogVisible">
        <div class="progress-bar" :style="{ width: `${scrollProgress}%` }" />
      </div>
      <el-backtop :visibility-height="200" :right="20" :bottom="80" />

      <div class="toc-float"
           :style="{ left: `${dragPosition.x}px`, top: `${dragPosition.y}px` }"
           @mousedown="handleFloatMouseDown"
           @touchstart.passive="handleFloatTouchStart">
        <div class="toc-ball" @click="toggleToc">
          <el-icon><Reading /></el-icon>
        </div>

        <transition name="toc-slide">
          <div v-show="tocVisible" class="toc-panel">
            <div class="toc-header">目录</div>
            <div class="toc-content">
              <div v-for="item in tocItems" :key="item.id">
                <div class="toc-item toc-h2"
                     :class="{ active: item.id === activeHeading }"
                     @click="() => { scrollToHeading(item.id); item.expanded = !item.expanded }">
                  <el-icon style="margin-right: 4px;">
                    <span v-if="item.children.length">{{ item.expanded ? '▼' : '▶' }}</span>
                  </el-icon>
                  {{ item.text }}
                </div>

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

      <div class="article-list" ref="articleListRef">
        <el-skeleton :rows="3" animated v-if="articlesLoading" />
        <div class="article-card" v-else>
          <div id="write" class="article-content" v-html="htmlContent" />
          <div class="copyright-tip">
            © Copyright by 花朝九日
          </div>
        </div>
      </div>

    </div>

    <el-image-viewer
        v-if="showImageViewer"
        :url-list="imagePreviewList"
        :initial-index="imageInitialIndex"
        @close="showImageViewer = false"
    />
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
  height: 160px; /* 原来是 160px，因为加了一行可能稍微挤，如果文字多可以改成 180px */
  padding: 10px 0; /* 增加一点内边距，防止内容贴边 */
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
  justify-content: center; /* 居中对齐 */
  align-items: center;
  flex-wrap: wrap;
  max-width: 90%; /* 防止手机上太宽 */
}

/* 单独一行的阅读时间 */
.read-time-line {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 8px; /* 与上面隔开一点距离 */
  font-size: 0.95rem;
  color: #eee;
  width: 100%;
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
  text-align: justify; /* 两端对齐 */
  letter-spacing: 0.02em;
}

/* === 新增样式：Mac 风格代码块 === */
:deep(.code-block-wrapper) {
  background: #f8f8f8;
  border-radius: 8px;
  margin: 1.5em 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  border: 1px solid #eaeaea;
}

:deep(.code-block-header) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f0f0f0;
  border-bottom: 1px solid #ddd;
}

:deep(.mac-dots) {
  display: flex;
  gap: 6px;
}
:deep(.mac-dots span) {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}
:deep(.mac-dots span:nth-child(1)) { background: #ff5f56; } /* 红 */
:deep(.mac-dots span:nth-child(2)) { background: #ffbd2e; } /* 黄 */
:deep(.mac-dots span:nth-child(3)) { background: #27c93f; } /* 绿 */

:deep(.lang-label) {
  font-size: 12px;
  color: #888;
  font-weight: bold;
  text-transform: uppercase;
  user-select: none;
}

:deep(.copy-btn) {
  border: none;
  background: white;
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  color: #555;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}
:deep(.copy-btn:hover) {
  background: #3db8d3;
  color: white;
}

:deep(.article-content pre) {
  margin: 0 !important;
  padding: 15px !important;
  background: transparent !important;
  border: none !important;
}

/* === 新增样式：表格滚动容器 === */
:deep(.table-wrapper) {
  overflow-x: auto;
  margin: 1.5em 0;
  border-radius: 8px;
  border: 1px solid #eee;
}
:deep(table) {
  width: 100%;
  border-collapse: collapse;
  min-width: 600px; /* 强制表格最小宽度，触发滚动 */
}

/* === 新增样式：超链接美化 === */
:deep(.article-content a) {
  color: #3db8d3;
  text-decoration: none;
  border-bottom: 1px dashed #3db8d3;
  transition: all 0.3s;
  padding-bottom: 1px;
}
:deep(.article-content a:hover) {
  background: rgba(61, 184, 211, 0.1);
  border-bottom-style: solid;
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