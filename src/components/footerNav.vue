<script setup>
// 跳转页面
const goToPage = (page) => {
  window.location.href = `/${page}`;
};
</script>

<template>
  <!-- 底部导航栏 -->
  <div class="footer-nav">
    <button @click="goToPage('')">Home</button>
    <button @click="goToPage('Articles')">Articles</button>
    <button @click="goToPage('About')">About</button>
  </div>
</template>

<style scoped>
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
</style>