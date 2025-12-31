<template>
  <div class="home">
    <div class="wallpaper-card" :style="{ backgroundImage: `url(${wallpaperUrl})` }">
      <h1>{{ title }}</h1> <!-- 使用传入的 title -->
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getWallPaper } from '@/api/WallpaperService.js';

// 接收父组件传递的参数
const props = defineProps({
  title: {
    type: String,
  }
});

const wallpaperUrl = ref('');

// 获取壁纸
const fetchWallpaper = async () => {
  try {
    let imageUrl = await getWallPaper();
    const wallpaperData = imageUrl.msg;
    const parsedData = JSON.parse(wallpaperData);
    const baseUrl = 'https://www.bing.com';
    imageUrl = baseUrl + parsedData.images[0].url;
    wallpaperUrl.value = imageUrl;
  } catch (error) {
    console.error('Error fetching wallpaper:', error);
  }
};

// 生命周期钩子
onMounted(() => {
  fetchWallpaper();
});
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
}
.wallpaper-card {
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
</style>
