<template>
  <div class="home">
    <!-- 顶部轮换壁纸 -->
    <div class="header" :style="{ backgroundImage: `url(${wallpaperUrl})` }">
      <h1>花朝九日's Blogger</h1>
    </div>
    <!-- 瀑布流文章列表 -->
    <div
        class="article-list"
        ref="articleList"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
    >
      <el-skeleton :rows="20" animated v-if="articlesLoading"/>
      <div class="article-card" v-else v-for="article in articles" :key="article.id" @click="getArticlesDetail(article.id)">
        <div class="article-content">
          <h3 class="article-title">{{ article.title }}</h3>
          <p class="article-summary">{{ article.summary }}</p>
        </div>
      </div>
    </div>
    <!-- 底部导航栏 -->
    <div class="footer-nav">
      <button @click="goToPage('')">主页</button>
      <button @click="goToPage('')">文章</button>
      <button @click="goToPage('')">关于</button>
    </div>
    <!-- 可拖动的悬浮球 -->
<!--    <div-->
<!--        class="floating-btn"-->
<!--        ref="floatingBtn"-->
<!--        @touchstart="onTouchStartForBall"-->
<!--        @touchmove="onTouchMoveForBall"-->
<!--        @touchend="onTouchEndForBall"-->
<!--        @click="toggleMenu"-->
<!--    >-->
<!--      <span>+</span>-->
<!--    </div>-->
    <!-- 菜单 -->
<!--    <div v-if="isMenuVisible" class="floating-menu" ref="floatingMenu">-->
<!--      <ul>-->
<!--        <li>菜单项 1</li>-->
<!--        <li>菜单项 2</li>-->
<!--        <li>菜单项 3</li>-->
<!--      </ul>-->
<!--    </div>-->
  </div>
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { getWallPaper } from "@/api/getWallPaper.js";
import {ElNotification} from "element-plus";
import {getTheArticlesForHome} from "@/api/getTheArticlesForHome.js";
import {HomeArticles, HomePage} from "@/api/globals.js";
    const articlesLoading = ref(false);
    const articles = ref([]);
    const getArticleList = async () => {
      articlesLoading.value = true;
      const res = await getTheArticlesForHome(HomePage.value, HomeArticles.value)
      articles.value = res.data.data.records;
      articlesLoading.value = false;
    }
    const getArticlesDetail = (articleId) => {
      ElNotification({
        title: '注意',
        message: "你要看的文章ID为" + articleId + ",此功能正在赶来的路上。",
        type: 'warning',
      })
    }
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
        const baseUrl = "https://www.bing.com";
        imageUrl = baseUrl + parsedData.images[0].url;
        wallpaperUrl.value = imageUrl;
        // 创建一个Image对象并加载壁纸
        const image = new Image();
        image.crossOrigin = "Anonymous";  // 处理跨域问题
        image.src = imageUrl;
        image.onload = () => {
          // 创建Canvas元素
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          // 设置canvas尺寸为图片的尺寸
          canvas.width = image.width;
          canvas.height = image.height;
          // 将图片绘制到Canvas上
          ctx.drawImage(image, 0, 0, image.width, image.height);
          // 获取图片顶部和底部的颜色数据
          const topColor = getAverageColor(ctx, 0, 0, image.width, image.height / 3);
          const bottomColor = getAverageColor(ctx, 0, image.height * 2 / 3, image.width, image.height);
          // 设置渐变色
          const gradient = `linear-gradient(to bottom, rgb(${topColor.r}, ${topColor.g}, ${topColor.b}), rgb(${bottomColor.r}, ${bottomColor.g}, ${bottomColor.b}))`;
          // document.body.style.background = gradient;
        };
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
    // 跳转页面
    const goToPage = (page) => {
      window.location.href = `/${page}`;
    };
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
    // 检测设备类型
    const checkDeviceType = () => {
      if (window.innerWidth > 768) {
        ElNotification({
          title: '注意',
          message: '当前页面暂未适配桌面端，请使用移动端设备进行浏览获得最佳效果。',
          type: 'warning',
        })
      }
    };
    // 生命周期钩子
    onMounted(() => {
      fetchWallpaper();
      calculateMaxScroll();
      checkDeviceType(); // 初次加载时检查设备
      window.addEventListener("resize", checkDeviceType); // 窗口大小变化时重新检查
      window.addEventListener("resize", calculateMaxScroll);
      document.addEventListener('touchstart', handleClickOutside);
      getArticleList();
    });
    onBeforeUnmount(() => {
      window.removeEventListener("resize", calculateMaxScroll);
      document.removeEventListener('touchstart', handleClickOutside);
      window.removeEventListener("resize", checkDeviceType); // 清理事件监听
    });
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  height: 100vh;
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
  width: 100%; /* 使文章卡片宽度为 100% */
  max-width: 1000px; /* 设置文章卡片最大宽度（调整为适合屏幕的宽度） */
  display: flex;
  flex-direction: column;
  border-radius: 25px;
  overflow: hidden;
  margin-bottom: 25px; /* 卡片之间的间距 */
  background-color: #ffffff; /* 白色背景 */
  box-shadow: 0 15px 20px rgba(0, 0, 0, 0.1); /* 细微阴影 */
  transition: transform 0.1s ease, box-shadow 0.1s ease; /* 动画效果 */
}
.article-card:hover {
  transform: translateY(-8px); /* 悬停时微微上浮 */
  box-shadow: 0 15px 25px rgba(0, 0, 0, 0.15); /* 增强阴影效果 */
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
}
/* 底部导航栏：亚克力透明效果 */
.footer-nav {
  display: flex;
  justify-content: space-evenly; /* 改为均匀分布 */
  align-items: center; /* 垂直居中 */
  position: fixed;
  bottom: 0;
  background: #EAEAEA;
  backdrop-filter: blur(10px);
  border-top: 1px solid #EAEAEA;
  padding: 10px 0;
  border-radius: 25px;
  margin: 0; /* 确保没有额外的外边距 */
  width: calc(100% - 20px); /* 如果需要控制内边距，确保宽度自适应 */
}
.footer-nav button {
  flex: 1; /* 按钮等分 */
  min-width: 80px; /* 可根据需要调整最小宽度 */
  text-align: center;
  background: none;
  border: none;
  padding: 10px;
  font-size: 16px;
  color: #555;
  transition: background-color 0.3s;
}
.footer-nav button:hover {
  background-color: rgba(255, 255, 255, 0.1); /* 悬浮时透明背景 */
}
.footer-nav button:focus {
  outline: none;
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

