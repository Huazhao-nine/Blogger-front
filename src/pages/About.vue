<template>
  <div class="home" v-if="isPhone">
    <!-- 顶部轮换壁纸 -->
    <div class="header" @click="router.push('/Login')" :style="{ backgroundImage: `url(${wallpaperUrl})` }">
      <time-button/>
      <div class="header-content">
        <!-- 左边头像 -->
        <img class="avatar" src="/src/assets/avatar.jpg" alt="头像" />
        <!-- 竖线 -->
        <div class="divider"></div>
        <!-- 右边介绍 -->
        <div class="intro">
          <h1>花朝九日</h1>
          <p>就在这长夜之后，凝结一座新宇宙</p>
        </div>
      </div>
    </div>
    <!-- 瀑布流文章列表 -->
    <about-me></about-me>
  </div>
  <div class="header" :style="{ backgroundImage: `url(${wallpaperUrl})` }" v-else>
    <h1 >请使用移动端访问获得更好体验</h1>
  </div>
</template>
<script setup>
import {onBeforeUnmount, onMounted, ref} from 'vue';
import {ElNotification} from 'element-plus';
import {getWallPaper} from '@/api/WallpaperService.js';
import AboutMe from "@/components/AboutMe.vue";
import {useRouter} from "vue-router";
import TimeButton from "@/components/TimeButton.vue";


const wallpaperUrl = ref('');
const router = useRouter()
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
  checkDeviceType(); // 初次加载时检查设备
  window.addEventListener('resize', checkDeviceType); // 窗口大小变化时重新检查
});

onBeforeUnmount(() => {
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
  align-items: center;
  justify-content: center;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

/* 内部左右布局容器 */
.header-content {
  display: flex;
  align-items: center;
  width: 90%; /* 根据需要调整宽度 */
  max-width: 1000px; /* 限制最大宽度 */
  margin: 0 auto;
}

/* 左侧头像样式 */
.avatar {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  margin-right: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  object-fit: cover;
  border: 3px solid rgba(255, 255, 255, 0.8); /* 添加白色边框 */
  background: linear-gradient(135deg, #f093fb, #f5576c); /* 添加渐变背景 */
}
.avatar:hover {
  transform: rotate(360deg);
  transition: transform 0.6s ease-in-out;
}


/* 竖线样式 */
.divider {
  width: 5px; /* 设置竖线宽度 */
  height: 60%; /* 设置竖线高度，相对头像和文字的高度 */
  background-color: rgba(255, 255, 255, 0.7); /* 设置竖线颜色和透明度 */
  margin: 0 20px; /* 设置竖线与左右内容之间的间距 */
}

/* 右侧介绍样式 */
.intro h1 {
  animation: fadeIn 0.5s ease-in-out;
  margin: 0;
  font-size: 20px; /* 标题字体大小 */
  font-weight: bold;
}

.intro p {
  animation: fadeIn 1s ease-in-out;
  margin: 8px 0 0; /* 段落间距 */
  font-size: 12px; /* 描述字体大小 */
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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

