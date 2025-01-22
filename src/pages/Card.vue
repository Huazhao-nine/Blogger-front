<template>
  <div class="container">
    <!-- 顶部导航 -->
    <header class="header">
      <span class="title">智说新语</span>
      <button class="share-button">分享卡片</button>
    </header>

    <!-- 内容卡片 -->
    <div class="card">
      <div class="card-header">
        <h1 class="festival-name">花朝九日</h1>
        <p class="translations">
          <span>Huā Zhāo Jiǔ Rì</span><br />
          <span>Cherry Blossom Festival</span><br />
          <span>Fête du printemps des cerisiers</span><br />
          <span>Традиционный фестиваль сакуры</span><br />
          <span>화조절</span>
        </p>
      </div>
      <div class="card-body">
        <p class="description">
          🌸🎉
        </p>
        <p class="quote">
          春风十里，<br />
          不如一枝花朝九日的柔情。
        </p>
      </div>
    </div>

    <!-- 底部信息 -->
    <footer class="footer">
      <p>
        内容由 AI 模型生成，仅供娱乐，不代表平台观点。
      </p>
      <div class="models">
        <span>GLM-4</span>
        <span>Qwen2</span>
        <span>DeepSeek-V2.5</span>
      </div>
      <p>Powered by SiliconFlow</p>
    </footer>
  </div>
</template>

<script>
export default {
  name: "FestivalCard",
};
</script>

<style scoped>
/* 容器和整体布局 */
.container {
  font-family: Arial, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f0f4ff;
  padding: 16px;
  height: 100vh;
}

/* 顶部导航 */
.header {
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 600px;
  padding: 8px 16px;
}

.title {
  font-size: 18px;
  font-weight: bold;
  color: #4a4a4a;
}

.share-button {
  background-color: #9f8aff;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.share-button:hover {
  background-color: #866fd0;
}

/* 卡片样式 */
.card {
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 16px;
  max-width: 600px;
  width: 100%;
  text-align: center;
}

.card-header {
  margin-bottom: 16px;
}

.festival-name {
  font-size: 24px;
  color: #4a4a4a;
  margin-bottom: 8px;
}

.translations span {
  display: block;
  color: #6c6c6c;
  font-size: 14px;
  line-height: 1.5;
}

.card-body .description {
  font-size: 32px;
  margin-bottom: 12px;
}

.card-body .quote {
  font-size: 16px;
  color: #4a4a4a;
  line-height: 1.5;
}

/* 底部信息 */
.footer {
  margin-top: auto;
  text-align: center;
  font-size: 12px;
  color: #6c6c6c;
}

.models span {
  background-color: #eef2ff;
  color: #4a4a4a;
  padding: 4px 8px;
  margin: 0 4px;
  border-radius: 12px;
}

.models span:hover {
  background-color: #d9e2ff;
}
</style>
