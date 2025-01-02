<script setup>
import { ref } from 'vue';
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
  <!-- 瀑布流文章列表 -->
  <div
      class="article-list"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
  >
    <div class="article-card">
      <div class="article-content">
        <h3 class="article-title">花朝九日's Blogger</h3>
        <p class="article-summary">

          前<el-tag type="success" size="small">Vue3</el-tag>
          后端<el-tag type="danger" size="small">SpringBoot3</el-tag>分离的博客系统
        </p>
      </div>
    </div>
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
        <h3 class="article-title">关于我</h3>
        <p class="article-summary">一个不会写歌的大学生不是一个好的程序员</p>
        <h3>联系我</h3>
        <ul>
          <li>QQ:982086195</li>
          <li>WeChat:FlowerInFire</li>
          <li>NetEaseMusic:LeibnizFormula</li>
        </ul>
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
  transform: translateY(-8px); /* 悬停时微微上浮 */
  box-shadow: 0 15px 25px rgba(0, 0, 0, 0.15); /* 增强阴影效果 */
}
/* 调整图片样式 */
.article-image {
  width: 100px; /* 设置图片的宽度 */
  height: 100px; /* 设置图片的高度 */
  object-fit: cover; /* 确保图片按比例裁剪 */
  border-radius: 10px; /* 设置圆角 */
  margin-left: 15px; /* 设置图片与卡片内容的间距 */
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