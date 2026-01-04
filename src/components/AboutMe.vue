<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useDraggable } from "@/api/useTouchScroll.js";
// import { fetchWallpaper } from "@/api/WallpaperService.js"; // 没用到似乎可以去掉，或者保留
// import router from "@/router/index.js"; // 没用到似乎可以去掉
import { getCpuInfo, getCpuTemp, getGpuInfo, getMemoryInfo } from "@/api/systemMonitorService.js";

const articleListRef = ref(null);
const cpuInfo = ref('CPU info is reading now');
const gpuInfo = ref('GPU info is reading now');
const memoryInfo = ref('Memory info is reading now');

let interval = null;

const getInfo = async () => {
  try {
    let res1 = await getCpuInfo()
    let res2 = await getGpuInfo()
    let res3 = await getMemoryInfo()
    let res4 = await getCpuTemp()

    // 加上非空判断，防止接口报错导致页面崩坏
    if(res1) cpuInfo.value = res1.msg + " Temp: " + (res4 ? getCpuTemperatures(res4) : 'N/A')
    if(res2) gpuInfo.value = res2.msg
    if(res3) memoryInfo.value = res3.msg
  } catch (e) {
    console.error("系统信息获取失败", e);
  }
}

// 解析出 CPU 温度
const getCpuTemperatures = (data) => {
  try {
    return JSON.parse(data.msg).Children[0].Children[1].Children[1].Children[0].Value
  } catch (e) {
    return 'N/A'
  }
}

const goToBeian = () => {
  window.open('https://beian.miit.gov.cn/', '_blank');
}
const goToBeian2 = () => {
  window.open('https://beian.mps.gov.cn/#/query/webSearch?code=42122102000232', '_blank');
}

const { calculateMaxScroll, bindTouchEvents, unbindTouchEvents } = useDraggable(articleListRef);

onMounted(() => {
  // 1. 挂载后立即请求一次，否则用户要干等 5 分钟才能看到数据
  getInfo();

  calculateMaxScroll();
  bindTouchEvents();
  window.addEventListener('resize', calculateMaxScroll);

  // 2. 开启定时器：5分钟刷新一次 (1000ms * 60s * 5)
  interval = setInterval(getInfo, 1000 * 60 * 10);
});

onBeforeUnmount(() => {
  unbindTouchEvents()
  // 清除定时器
  if (interval) {
    clearInterval(interval)
    interval = null
  }
  window.removeEventListener('resize', calculateMaxScroll);
});
</script>

<template>
  <div
      class="article-list"
      ref="articleListRef"
  >
    <div class="article-card">
      <div class="article-content">
        <h3 class="article-title">MBTI</h3>
        <p class="article-summary" style="color: #88619A;">建筑师 INTJ-A</p>
      </div>
      <img class="article-image" src="/src/assets/intj-portrait.svg" alt="INTJ 画像"/>
    </div>
    <div class="article-card">

      <div class="article-content">
        <h3 class="article-title">About</h3>
        <p class="article-summary">我悲喜都 只换来这场 无声的野火</p>
        <h3>Contact</h3>
        <ul>
          <li>QQ:982086195</li>
          <li>WeChat:FlowerInFire</li>
        </ul>
      </div>
    </div>
    <div class="article-card">
      <div class="article-content">
        <h3 class="article-title">
          花朝九日's Blogger-V1.2.2
        </h3>
        <p>
          ICP备案号：
          <el-tag
              type="info"
              size="small"
              effect="plain"
              @click="goToBeian"
              style="cursor: pointer;"
          >
            鄂ICP备2025092180号
          </el-tag>
        </p>
        <p>
          公安备案号：
          <el-tag
              type="info"
              size="small"
              effect="plain"
              @click="goToBeian2"
              style="cursor: pointer;"
          >
            <img src="/src/assets/备案图标.png" style="height: 10px;" alt="备案图标"></img>
            鄂公网安备42122102000232号
          </el-tag>
        </p>
        <p class="article-summary">
          前
          <el-tag type="success" size="small" effect="plain">Vue3</el-tag>
          后端
          <el-tag type="danger" size="small" effect="plain">SpringBoot3</el-tag>
          分离的个人博客
        </p>
        <h3 class="article-title">
          Blogger state
        </h3>
        <p class="article-summary">
          {{ cpuInfo }}
        </p>
        <p class="article-summary">
        </p>
        <p class="article-summary">
          {{ memoryInfo }}
        </p>
        <p class="copyright">Copyright 2024-2025 花朝九日 All Rights Reserved</p>

      </div>
    </div>

  </div>
</template>

<style scoped>
/* 样式保持不变，直接粘贴你原来的即可 */
.intro h1 {
  margin: 0;
  font-size: 20px;
  font-weight: bold;
}

.intro p {
  margin: 8px 0 0;
  font-size: 12px;
}

.categories a {
  display: block;
  margin: 8px 0;
  color: #333;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
}

.categories a:hover {
  color: #007bff;
}

.article-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  margin-top: 24px;
  overflow: hidden;
  align-items: center;
  will-change: transform;
  transition: transform 0.1s ease;
}

.article-list {
  overflow-y: scroll;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.article-list::-webkit-scrollbar {
  display: none;
}

.article-card {
  width: 100%;
  max-width: 1000px;
  display: flex;
  flex-direction: row;
  border-radius: 25px;
  overflow: hidden;
  margin-bottom: 8px;
  background-color: #FFFFFE;
  box-shadow: 0 15px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}

.article-card:hover {
  transform: scale(1.02);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.article-image {
  width: 120px;
  height: auto;
  margin-left: 20px;
}

.article-content {
  padding: 10px;
  flex: 1;
}

.article-title {
  font-size: 1.2em;
  margin: 0 0 10px;
  font-weight: bold;
  color: #333;
}

.article-summary {
  font-size: 1em;
  color: #666;
  font-weight: 500;
  margin-bottom: 8px;
}

.floating-menu ul {
  list-style-type: none;
  margin: 0;
  padding: 0;
}

.floating-menu ul li {
  margin: 8px 0;
  cursor: pointer;
}

.floating-menu ul li:hover {
  color: #007bff;
}
</style>