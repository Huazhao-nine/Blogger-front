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
.footer-nav {
  display: flex;
  justify-content: space-evenly;
  align-items: center;

  /* 固定定位 */
  position: fixed;

  /* 底部距离：留出一点空隙，做成悬浮感，不要贴底 */
  bottom: 20px;

  /* 【核心修复】强制左右距离相等，实现绝对居中 */
  left: 20px;  /* 左边距 20px */
  right: 20px; /* 右边距 20px */
  width: auto; /* 让宽度自动计算 (100% - 40px) */
  margin: 0;   /* 清除默认边距 */

  /* 样式保持不变 */
  background: rgba(234, 234, 234, 0.8); /* 稍微调整透明度 */
  backdrop-filter: blur(10px);
  border-top: 1px solid #EAEAEA;
  padding: 10px 0;
  border-radius: 25px;

  /* 层级：确保在最上层，不会被文章遮挡 */
  z-index: 999;

  /* 阴影优化：增加层次感 */
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.footer-nav button {
  flex: 1;
  text-align: center;
  background: none;
  border: none;
  padding: 10px;
  font-size: 16px;
  color: #555;
  transition: all 0.3s;
  /* 增加点击区域圆角 */
  border-radius: 12px;
}

.footer-nav button:hover {
  background-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px); /* 微动效 */
}

.footer-nav button:active {
  transform: scale(0.95);
}
</style>