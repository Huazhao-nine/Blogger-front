<template>
  <div class="home" v-if="isPhone">
    <!-- 顶部轮换壁纸 -->
    <div class="header" :style="{ backgroundImage: `url(${wallpaperUrl})` }">
      <h1 class="typing-effect">花朝九日's Blogger</h1>
    </div>
    <!-- 瀑布流文章列表 -->
    <div
        class="article-list"
        ref="articleListRef"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
    >
      <el-skeleton :rows="20" animated v-if="articlesLoading" />
      <div
          class="article-card"
          v-else
          v-for="article in articles"
          :key="article.id"
          @click="getArticlesDetail(article.id)"
      >
        <top-button :isPinned="article.isPinned" desc="置顶中"/>
        <div class="article-content">
          <h3 class="article-title">{{ article.title }}</h3>
          <p class="article-summary">{{ article.summary }}</p>
        </div>
      </div>
    </div>

    <!-- 底部导航栏 -->

    <!-- 可拖动的悬浮球 -->
    <!--
    <div
      class="floating-btn"
      ref="floatingBtn"
      @touchstart="onTouchStartForBall"
      @touchmove="onTouchMoveForBall"
      @touchend="onTouchEndForBall"
      @click="toggleMenu"
    >
      <span>+</span>
    </div>
    -->

    <!-- 菜单 -->
    <!--
    <div v-if="isMenuVisible" class="floating-menu" ref="floatingMenu">
      <ul>
        <li>菜单项 1</li>
        <li>菜单项 2</li>
        <li>菜单项 3</li>
      </ul>
    </div>
    -->
  </div>
  <div class="header" :style="{ backgroundImage: `url(${wallpaperUrl})` }" v-else>
    <h1 >请使用移动端访问获得更好体验</h1>
  </div>
</template>

<script setup>
import {onBeforeUnmount, onMounted, ref} from 'vue';
import {ElNotification} from 'element-plus';
import {HomeArticles, HomePage} from '@/api/globals.js';
import {getWallPaper} from '@/api/WallpaperService.js';
import {getTheArticlesForHome} from '@/api/ArticleService.js';
import {useRouter} from "vue-router";
import TopButton from "@/components/TopButton.vue";
import {useAuthStore} from "@/stores/auth.js";

const articlesLoading = ref(false);
const articles = ref([]);
const auth = useAuthStore()

const welcome = () => {
  if (auth.isAuthenticated){
    ElNotification({
      title: auth.user.name,
      message: "欢迎回来！",
      type: 'success',
    });
  }
}

const getArticleList = async () => {
  articlesLoading.value = true;
  const res = await getTheArticlesForHome(HomePage.value, HomeArticles.value);
  articles.value = res.data.data;
  // console.log(articles.value);
  articlesLoading.value = false;
};

const router = useRouter()
const firstClick = ref(true)
const getArticlesDetail = async (articleId) => {
  // const response = await getArticleByID(articleId);
  // const article = response.data.data;
  // if (firstClick.value){
  //   ElNotification({
  //     title: '正在跳转',
  //     message: '正在前往文章的路上',
  //     type: 'warning',
  //   });
  //   firstClick.value = false
  // }
  await router.push(`/article/articleID=${articleId}`);
};

const wallpaperUrl = ref('');
const isMenuVisible = ref(false);
const isDraggingForBall = ref(false);
const startXForBall = ref(0);
const startYForBall = ref(0);
const offsetXForBall = ref(0);
const offsetYForBall = ref(0);
const startY = ref(0);
const currentY = ref(0);
const isDragging = ref(false);
const maxScroll = ref(0);

// 切换菜单显示状态
const toggleMenu = (event) => {
  isMenuVisible.value = !isMenuVisible.value;
  event.stopPropagation(); // 阻止事件冒泡
};

// 处理悬浮球拖动
const onTouchStartForBall = (event) => {
  isDraggingForBall.value = true;
  const touch = event.touches[0];
  startXForBall.value = touch.clientX - offsetXForBall.value;
  startYForBall.value = touch.clientY - offsetYForBall.value;
  event.preventDefault();
};

const onTouchMoveForBall = (event) => {
  if (!isDraggingForBall.value) return;
  const touch = event.touches[0];
  offsetXForBall.value = touch.clientX - startXForBall.value;
  offsetYForBall.value = touch.clientY - startYForBall.value;
  const floatingBtn = document.querySelector('.floating-btn');
  floatingBtn.style.transform = `translate(${offsetXForBall.value}px, ${offsetYForBall.value}px)`;
  event.preventDefault();
};

const onTouchEndForBall = () => {
  isDraggingForBall.value = false;
};

// 点击其他地方隐藏菜单
const handleClickOutside = (event) => {
  const floatingBtn = document.querySelector('.floating-btn');
  const floatingMenu = document.querySelector('.floating-menu');
  if (
      floatingBtn &&
      !floatingBtn.contains(event.target) &&
      floatingMenu &&
      !floatingMenu.contains(event.target)
  ) {
    isMenuVisible.value = false;
  }
};

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

// 获取指定区域的平均颜色
const getAverageColor = (ctx, x, y, width, height) => {
  const imageData = ctx.getImageData(x, y, width, height);
  const data = imageData.data;
  let r = 0, g = 0, b = 0;
  for (let i = 0; i < data.length; i += 4) {
    r += data[i];     // red
    g += data[i + 1]; // green
    b += data[i + 2]; // blue
  }

  const pixelCount = data.length / 4;
  r = Math.floor(r / pixelCount);
  g = Math.floor(g / pixelCount);
  b = Math.floor(b / pixelCount);

  return { r, g, b };
};

// 计算最大滚动范围
const calculateMaxScroll = () => {
  const articleList = document.querySelector('.article-list');
  maxScroll.value = articleList.clientHeight - articleList.scrollHeight;
};

// 滑动事件处理
const onTouchStart = (event) => {
  startY.value = event.touches[0].pageY - currentY.value;
  isDragging.value = true;
};

const articleListRef = ref(null);
const onTouchMove = (event) => {
  if (!isDragging.value) return;
  currentY.value = event.touches[0].pageY - startY.value;
  if (currentY.value > 0) {
    currentY.value /= 2;
  } else if (currentY.value < maxScroll.value) {
    currentY.value = maxScroll.value + (currentY.value - maxScroll.value) / 2;
  }
  articleListRef.value.style.transform = `translateY(${currentY.value}px)`;
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

// 生命周期钩子
onMounted(() => {
  fetchWallpaper();
  calculateMaxScroll();
  checkDeviceType(); // 初次加载时检查设备
  window.addEventListener('resize', checkDeviceType); // 窗口大小变化时重新检查
  window.addEventListener('resize', calculateMaxScroll);
  document.addEventListener('touchstart', handleClickOutside);
  getArticleList();
  // console.log("任何问题请联系982086195@qq.com")
  welcome()
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', calculateMaxScroll);
  document.removeEventListener('touchstart', handleClickOutside);
});
</script>
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
/*隐藏滚动条*/
.article-list {
  overflow-y: scroll; /* 保留滚动功能 */
  -ms-overflow-style: none; /* 隐藏 IE 滚动条 */
  scrollbar-width: none; /* 隐藏 Firefox 滚动条 */
}
.article-list::-webkit-scrollbar {
  display: none; /* 隐藏 Chrome 和 Safari 滚动条 */
}
.article-card {
  position: relative;
  width: 100%;
  max-width: 1000px;
  display: flex;
  flex-direction: column;
  border-radius: 25px;
  overflow: hidden;
  margin-bottom: 25px;
  background-color: #FFFFFE;
  box-shadow: 0 15px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}

.article-card:hover {
  transform: scale(1.02); /* 微微放大 */
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2); /* 加强阴影 */
}
.article-content {
  padding: 15px;
}
.article-title {
  font-size: 1.3em;
  margin: 0 0 10px;
  font-weight: 1000;
  color: #333; /* 标题颜色，深灰色 */
}
.article-summary {
  font-size: 1.0em;
  color: #555;
  font-weight: 500;
}

.floating-btn {
  position: fixed;
  bottom: 50px; /* 距离页面底部20px */
  right: 50px; /* 距离页面右侧20px */
  width: 50px;
  height: 50px;
  background-color: #4D81DA; /* 你可以选择任何颜色 */
  border-radius: 50%; /* 圆形按钮 */
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  color: white;
  font-size: 20px;
  transition: transform 0.3s;
}
.floating-btn:hover {
  transform: scale(1.1); /* 悬浮球点击时稍微放大 */
}
.floating-menu {
  position: absolute;
  bottom: 80px; /* 菜单距离悬浮球的垂直距离 */
  right: 20px;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 8px;
  padding: 15px;
  z-index: 999; /* 确保菜单位于悬浮球之下 */
}
.floating-menu ul {
  list-style-type: none;
  margin: 0;
  padding: 0;
}
.floating-menu ul li {
  margin: 10px 0;
  cursor: pointer;
}
.typing-effect {
  animation: fadeIn 1.5s ease-in-out;
  font-size: 2em;
  font-weight: 700;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  display: inline-block;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}




</style>

