<script setup>
import { useRouter } from "vue-router";
const router = useRouter()

// 直接用 name 跳转更稳定 (需要在 router/index.js 里定义 name)
const navItems = [
  { label: 'Home', name: 'Home' }, // 对应 router 里的 name: 'Home'
  { label: 'Category', name: 'Category' },
  { label: 'About', name: 'About' }
]
</script>

<template>
  <div class="footer-nav">
    <button
        v-for="item in navItems"
        :key="item.name"
        @click="router.push({ name: item.name })"
    >
      {{ item.label }}
    </button>
  </div>
</template>

<style scoped>
/* 底部导航栏：亚克力透明效果 */
.footer-nav {
  display: flex;
  justify-content: space-evenly; /* 改为均匀分布 */
  align-items: center; /* 垂直居中 */
  background: #EAEAEA;
  backdrop-filter: blur(10px);
  border-top: 1px solid #EAEAEA;
  padding: 10px 0;
  border-radius: 25px;
  margin: 0; /* 确保没有额外的外边距 */
  width: calc(100% - 20px); /* 如果需要控制内边距，确保宽度自适应 */
  position: fixed;
  bottom: 20px; /* 稍微离底边有点距离好看点 */
  /* 居中方案 */
  left: 20px;
  right: 20px;

  z-index: 999; /* ❗关键：防止被文章内容遮挡 */

  /* 玻璃拟态增强 */
  background: rgba(234, 234, 234, 0.8);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
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
</style>