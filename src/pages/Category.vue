<template>
  <div class="home" v-if="isPhone">
    <!-- 顶部轮换壁纸 -->
    <wallpaper-card title="分类"/>

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
          v-for="category in categories"
          :key="category.id"
          @click="getCategoryDetail(category.id)"
      >
        <top-button :isPinned="true" desc="╰(✿´⌣`✿)╯♡" />
        <div class="article-content">
          <h3 class="article-title">{{ category.name }}</h3>
          <p class="article-summary">{{ category.instruction }}</p>
        </div>
      </div>
    </div>
  </div>
  <div class="header" :style="{ backgroundImage: `url(${wallpaperUrl})` }" v-else>
    <h1 >请使用移动端访问获得更好体验</h1>
  </div>
</template>

<script setup>
import {onBeforeUnmount, onMounted, ref} from 'vue';
import {ElNotification} from 'element-plus';
import {getWallPaper} from '@/api/WallpaperService.js';
import TopButton from "@/components/TopButton.vue";
import {useRouter} from "vue-router";
import WallpaperCard from "@/components/WallpaperCard.vue";
import {getAllCategories} from "@/api/CategoryService.js";

const articlesLoading = ref(false);
const categories = ref([]);

const getArticleList = async () => {
  articlesLoading.value = true;
  const res = await getAllCategories();
  categories.value = res.data.data;
  // console.log(categories.value)
  articlesLoading.value = false;
};

const wallpaperUrl = ref('');
const startY = ref(0);
const currentY = ref(0);
const isDragging = ref(false);
const maxScroll = ref(0);

const router1 = useRouter()
const getCategoryDetail = async (categoryId) => {
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
  await router1.push(`/article/categoryID=${categoryId}`);
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
  getArticleList();
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', calculateMaxScroll);
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
  overflow: hidden;
  align-items: center;
  will-change: transform;
  transition: transform 0.1s ease;
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
  z-index: 1; /* 默认z-index为1，确保每个卡片有自己的层级 */
}

/* 鼠标悬停时，卡片微放大并提高层级 */
.article-card:hover {
  transform: translateY(-10px) scale(1.05); /* 卡片向上移动并稍微放大 */
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  z-index: 10; /* 增加z-index，确保悬停时的卡片位于其他卡片上方 */
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


</style>

