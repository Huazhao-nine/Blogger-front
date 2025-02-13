<template>
  <div class="home">
    <!-- 顶部轮换壁纸 -->
    <div @click="goToEdit" class="header" :style="{ backgroundImage: `url(${wallpaperUrl})` }">
      <h1 >文章列表</h1>
    </div>

    <!-- 瀑布流文章列表 -->
    <div
        class="article-list"
        ref="articleListRef"
    >
      <el-skeleton :rows="20" animated v-if="articlesLoading" />
      <div
          class="article-card"
          v-else
          v-for="article in articles"
          :key="article.id"
          @click="getArticlesDetail(article.id, auth.token)"
      >
        <top-button :isPinned="article.isPinned" :locked="article.locked" desc="置顶中"/>
        <div class="article-content">
          <h3 class="article-title">{{ article.title }}</h3>
          <p class="article-summary">{{ article.summary }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {onBeforeUnmount, onMounted, ref} from 'vue';
import {ElNotification} from 'element-plus';
import {fetchWallpaper} from '@/api/WallpaperService.js';
import {getArticlesByCategory, getArticlesDetail} from '@/api/ArticleService.js';
import TopButton from "@/components/TopButton.vue";
import {useRoute, useRouter} from "vue-router";
import {useDraggable} from "@/api/useTouchScroll.js";
import {goToEdit} from "@/api/RoleService.js";
import {useAuthStore} from "@/stores/auth.js";

const route = useRoute();// 获取当前路由信息
const router1 = useRouter()
const auth = useAuthStore()
const articlesLoading = ref(false);
const articles = ref([]);

const getArticleList = async () => {
  articlesLoading.value = true;
  const id = route.params.id;// 从路由参数中提取 articleId
  const res = await getArticlesByCategory(id);
  articles.value = res.data.data;
  // console.log(articles)
  articlesLoading.value = false;
};

const wallpaperUrl = ref('');
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
const articleListRef = ref(null);
const { calculateMaxScroll, bindTouchEvents, unbindTouchEvents } = useDraggable(articleListRef);

// 生命周期钩子
onMounted(() => {
  fetchWallpaper(wallpaperUrl);
  calculateMaxScroll(); // 计算最大滚动范围
  bindTouchEvents(); // 绑定触摸事件
  checkDeviceType(); // 初次加载时检查设备
  // window.addEventListener('resize', checkDeviceType); // 窗口大小变化时重新检查
  window.addEventListener('resize', calculateMaxScroll);
  getArticleList();
});

onBeforeUnmount(() => {
  unbindTouchEvents()
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
.floating-menu ul li:hover {
  color: #007bff; /* 悬浮时改变文字颜色 */
}
</style>

