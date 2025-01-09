<script setup>
import {nextTick, onMounted, onUnmounted, ref} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {getArticleByID} from "@/api/ArticleService.js";
import {ElNotification} from "element-plus";
import {getWallPaper} from "@/api/WallpaperService.js";
import {Clock, Postcard, User, View} from "@element-plus/icons-vue";
import {marked} from "marked";
import katex from 'katex';
import 'katex/dist/katex.min.css'; // 导入 KaTeX 的样式
import 'highlight.js/styles/atom-one-light.css'; // 在此引入高亮样式
import hljs from "highlight.js";
import TopButton from "@/components/TopButton.vue"; // 引入 useRoute 来访问路由信息
const articlesLoading = ref(false)
const route = useRoute();// 获取当前路由信息
const article = ref({})
const getArticle = async () => {
  articlesLoading.value = true
  const id = route.params.id;// 从路由参数中提取 articleId
  const res = await getArticleByID(id);
  article.value = res.data.data
  await getMarkdownContent()
  articlesLoading.value = false
}
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric' });
};
onMounted(() => {
  getArticle();
  fetchWallpaper();
  checkDeviceType();  // 初始化检测设备类型
  window.addEventListener('resize', checkDeviceType); // 添加监听器以动态检测设备类型
});

onUnmounted(() => {
  window.removeEventListener('resize', checkDeviceType); // 清除监听器
});


const isPhone = ref(true)
// 检测设备类型
const checkDeviceType = () => {
  if (window.innerWidth > 768) {
    isPhone.value = false
    ElNotification({
      title: '页面暂未适配',
      message: '当前页面暂未适配桌面端，请使用移动端设备进行浏览获得最佳效果。',
      type: 'warning',
    });
  }else isPhone.value = true
};

const wallpaperUrl = ref('');
// 获取壁纸
const fetchWallpaper = async () => {
  try {
    let imageUrl = await getWallPaper();
    const wallpaperData = imageUrl.data.msg;
    const parsedData = JSON.parse(wallpaperData);
    const baseUrl = 'https://www.bing.com';
    imageUrl = baseUrl + parsedData.images[0].url;
    wallpaperUrl.value = imageUrl;
  } catch (error) {
    console.error('Error fetching wallpaper:', error);
  }
};
const htmlContent = ref()
const getMarkdownContent = async () => {
  const markedOptions = {
    gfm: true,
    breaks: true,
    renderer: new marked.Renderer(),
  };
  marked.setOptions(markedOptions);
  // 使用 marked 渲染文章内容
  htmlContent.value = marked(article.value.content);
  console.log('Rendered HTML before latex replacement:', htmlContent.value);

  // 调用 replaceLatexWithClass 来替换所有公式
  replaceLatexWithClass();
  console.log('Rendered HTML after latex replacement:', htmlContent.value);

  // 确保 DOM 更新完毕后，再执行 LaTeX 渲染
  await nextTick();  // 等待 DOM 更新

  // 延迟执行 renderLatex，确保 HTML 渲染完毕
  setTimeout(() => {
    // 渲染 LaTeX 公式
    renderLatex();
  }, 100);  // 增加延迟，确保 DOM 渲染完成

  // 高亮代码块
  setTimeout(() => {
    hljs.highlightAll();
  }, 50);  // 等待 markdown 渲染完成后再进行高亮
};

// 替换 htmlContent 中的 LaTeX 公式
const replaceLatexWithClass = () => {
  // 替换 $$ ... $$ 为 .math 类
  htmlContent.value = htmlContent.value.replace(/\$\$([\s\S]+?)\$\$/g, (match, latex) => {
    // 移除所有 <br> 标签和多余的空格
    latex = latex.replace(/<br>/g, ' ').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
    return `<span class="math">${latex}</span>`;
  });

  // 替换 \( ... \) 为 .inline-math 类
  htmlContent.value = htmlContent.value.replace(/\\\(([\s\S]+?)\\\)/g, (match, latex) => {
    latex = latex.replace(/<br>/g, ' ').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
    return `<span class="inline-math">${latex}</span>`;
  });
};

const renderLatex = () => {
  // 查找所有包含 LaTeX 公式的元素（即 .math 类）
  const mathElements = document.querySelectorAll('.math');
  console.log('Found math elements:', mathElements); // 输出匹配的元素

  // 使用 KaTeX 渲染公式
  mathElements.forEach((element) => {
    katex.render(element.textContent, element, {
      throwOnError: false,  // 如果公式有错误，不抛出异常
    });
  });
};
const router = useRouter()
const edit = async () => {
  await router.push(`/Edit/articleID=${article.value.id}`);
};


const startY = ref(0);
const currentY = ref(0);
const isDragging = ref(false);
const maxScroll = ref(0);

// 滑动事件处理
const onTouchStart = (event) => {
  startY.value = event.touches[0].pageY - currentY.value;
  isDragging.value = true;
};

const onTouchMove = (event) => {
  if (!isDragging.value) return;
  currentY.value = event.touches[0].pageY - startY.value;
  if (currentY.value > 0) {
    currentY.value /= 2;
  } else if (currentY.value < maxScroll.value) {
    currentY.value = maxScroll.value + (currentY.value - maxScroll.value) / 2;
  }
  const articleList = document.querySelector('.article-list');
  articleList.style.transform = `translateY(${currentY.value}px)`;
};

const onTouchEnd = () => {
  if (!isDragging.value) return;
  isDragging.value = false;
  if (currentY.value > 0) {
    currentY.value = 0;
  } else if (currentY.value < maxScroll.value) {
    currentY.value = maxScroll.value;
  }
  const articleList = document.querySelector('.article-list');
  articleList.style.transition = 'transform 0.3s ease';
  articleList.style.transform = `translateY(${currentY.value}px)`;
  setTimeout(() => {
    articleList.style.transition = '';
  }, 300);
};
</script>
<template>
  <div class="home" v-if="isPhone">
    <!-- 顶部轮换壁纸 -->
    <div @click="edit" class="header" :style="{ backgroundImage: `url(${wallpaperUrl})` }">
      <top-button :isPinned="article.isPinned" desc="置顶中" />
      <h2 >{{article.title}}</h2>
      <div class="article-meta">
        <div class="views">
          <el-icon><Postcard /></el-icon>
          {{article.categoryName}}
        </div>
        <div class="author">
          <el-icon><View /></el-icon>
          {{article.viewCount}}
        </div>
        <div class="author">
          <el-icon><User /></el-icon>
          {{article.authorName}}
        </div>
        <div class="date">
          <el-icon><Clock /></el-icon>
          {{ formatDate(article.publishedAt) }}
        </div>
      </div>

    </div>
    <!-- 瀑布流文章列表 -->
    <div
        class="article-list"
        ref="articleList"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
    >
      <el-skeleton :rows="20" animated v-if="articlesLoading" />
      <div
          class="article-card"
          v-else
      >
        <div class="article-content" v-html="htmlContent"></div>
      </div>
    </div>
  </div>
  <div class="header" :style="{ backgroundImage: `url(${wallpaperUrl})` }" v-else>
    <h1 >请使用移动端访问获得更好体验</h1>
  </div>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
}
.header {
  border-radius: 25px; /* 设置更平滑的圆角 */
  overflow: hidden; /* 确保圆角生效 */
  background-size: cover; /* 背景图自动覆盖 */
  background-position: center; /* 居中背景图 */
  height: 150px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}
.categories a {
  display: block;
  margin: 10px 0;
  color: #333;
  text-decoration: none;
  font-size: 18px;
  font-weight: 500;
}
.categories a:hover {
  color: #007bff; /* 悬浮时颜色 */
}
.article-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
  margin-top: 25px;
  overflow: hidden; /* 隐藏滚动条 */
  align-items: center;
  will-change: transform;
  transition: transform 0.1s ease;
}
.article-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
  margin-top: 25px;
  align-items: center;
  will-change: transform;
  transition: transform 0.1s ease;
}


.article-card {
  width: 100%; /* 使文章卡片宽度为 100% */
  max-width: 1000px; /* 设置文章卡片最大宽度（调整为适合屏幕的宽度） */
  display: flex;
  flex-direction: column;
  border-radius: 25px;
  overflow: hidden;
  margin-bottom: 25px; /* 卡片之间的间距 */
  background-color: #FFFFFE; /* 白色背景 */
  box-shadow: 0 15px 20px rgba(0, 0, 0, 0.1); /* 细微阴影 */
  transition: transform 0.1s ease, box-shadow 0.1s ease; /* 动画效果 */
}
.article-card:hover {
  transform: translateY(-8px); /* 悬停时微微上浮 */
  box-shadow: 0 15px 25px rgba(0, 0, 0, 0.15); /* 增强阴影效果 */
}
.article-content {
  padding: 20px;
  font-size: 1.0em;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.article-meta .views, .article-meta .author, .article-meta .date {
  display: flex;
  align-items: center;
  margin: 0 10px;  /* 给每个元素添加左右间距 */
}
.article-meta .author {
  text-align: center;
}

.article-meta .date {
  text-align: right;
}



</style>