<script setup>
import {onBeforeUnmount, onMounted, ref} from 'vue';
import {useDraggable} from "@/api/useTouchScroll.js";
import {fetchWallpaper} from "@/api/WallpaperService.js";
import router from "@/router/index.js";
const articleListRef = ref(null);
const goToBeian = () => {
  window.open('https://beian.miit.gov.cn/', '_blank'); // 新窗口打开网址
}
const { calculateMaxScroll, bindTouchEvents, unbindTouchEvents } = useDraggable(articleListRef);
onMounted(() => {
  calculateMaxScroll(); // 计算最大滚动范围
  bindTouchEvents(); // 绑定触摸事件
  window.addEventListener('resize', calculateMaxScroll);
});

onBeforeUnmount(() => {
  unbindTouchEvents()
  window.removeEventListener('resize', calculateMaxScroll);
});
</script>

<template>
  <!-- 瀑布流文章列表 -->
  <div
      class="article-list"
      ref="articleListRef"
  >
    <div class="article-card">
      <div class="article-content">
        <h3 class="article-title">MBTI</h3>
        <p class="article-summary" style="color: #88619A;">建筑师 INTJ-A</p>
      </div>
      <!-- 右侧图片 -->
      <img class="article-image" src="/src/assets/intj-portrait.svg" alt="INTJ 画像" />
    </div>
    <div class="article-card">

      <div class="article-content">
        <h3 class="article-title">小镇里的花</h3>
        <ul>
          <li>
            <p class="article-summary">我悲喜都 只换来这场 无声的野火</p>
          </li>
          <li>
            <p class="article-summary">那场火 烧出不坏的 那尊是我</p>
          </li>
        </ul>
        <h3>联系我</h3>
        <ul>
          <li>QQ:982086195</li>
          <li>WeChat:FlowerInFire</li>
<!--          <li>NetEaseMusic:LeibnizFormula</li>-->
        </ul>
      </div>
    </div>
    <div class="article-card">
      <div class="article-content">
        <h3 class="article-title">
          花朝九日's Blogger
          <el-tag
              type="info"
              size="small"
              effect="plain"
              @click="goToBeian"
              style="cursor: pointer;"
          >
            备案号：
            鄂ICP备2025092180号-2
          </el-tag>
        </h3>
        <p>

        </p>
        <p class="article-summary">
          前<el-tag type="success" size="small" effect="plain">Vue3</el-tag>
          后端<el-tag type="danger" size="small" effect="plain">SpringBoot3</el-tag>分离的个人博客
        </p>
        <p class="copyright">Copyright 2024-2025 花朝九日 All Rights Reserved.</p>

      </div>
    </div>

  </div>
</template>

<style scoped>
/* 右侧介绍样式 */
.intro h1 {
  margin: 0;
  font-size: 20px; /* 标题字体大小 */
  font-weight: bold;
}

.intro p {
  margin: 8px 0 0; /* 段落间距 */
  font-size: 12px; /* 描述字体大小 */
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
  max-width: 1000px; /* 设置文章卡片最大宽度 */
  display: flex;
  flex-direction: row; /* 横向布局，使内容和图片并排显示 */
  border-radius: 25px;
  overflow: hidden;
  margin-bottom: 10px;
  background-color: #FFFFFE; /* 白色背景 */
  box-shadow: 0 15px 20px rgba(0, 0, 0, 0.1); /* 细微阴影 */
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}
.article-card:hover {
  transform: scale(1.02); /* 微微放大 */
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2); /* 加强阴影 */
}

/* 调整图片样式 */
.article-image {
  width: 120px;
  height: auto; /* 保持比例 */
  margin-left: 20px;
}
.article-content {
  padding: 15px;
  flex: 1; /* 使内容区域占满剩余空间 */
}

/* 可以适当减少文章标题的字体大小和间距 */
.article-title {
  font-size: 1.2em;
  margin: 0 0 10px;
  font-weight: bold;
  color: #333;
}

.article-summary {
  font-size: 1em;
  color: #555;
  font-weight: 500;
  margin-bottom: 10px;
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