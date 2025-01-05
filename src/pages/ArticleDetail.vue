<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import {getArticleByID} from "@/api/ArticleService.js";
import {ElNotification} from "element-plus";
import {getWallPaper} from "@/api/WallpaperService.js";
import {Clock, User, View} from "@element-plus/icons-vue";
import {marked} from "marked";
import 'highlight.js/styles/atom-one-light.css';  // 在此引入高亮样式
import hljs from "highlight.js";
import TopButton from "@/components/TopButton.vue";  // 引入 useRoute 来访问路由信息
const articlesLoading = ref(false)
const route = useRoute();// 获取当前路由信息
const article = ref({})
const getArticle = async () => {
  articlesLoading.value = true
  const id = route.params.id;// 从路由参数中提取 articleId
  // console.log(id)
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
  htmlContent.value = await marked(article.value.content);
  // console.log(htmlContent.value)
  setTimeout(() => {
    // 使用 highlightAll 自动高亮所有代码块
    hljs.highlightAll();
  }, 50);  // 等待 markdown 渲染完成后再进行高亮
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
    <div class="header" :style="{ backgroundImage: `url(${wallpaperUrl})` }">
      <top-button :isPinned="article.isPinned" />
      <h2 >{{article.title}}</h2>
      <div class="article-meta">
        <div class="views">
          <el-icon><View /></el-icon>{{article.viewCount}}
        </div>
        <div class="author">
          <el-icon><User /></el-icon>{{article.authorName}}
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