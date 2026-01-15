<template>
  <WidgetCard title="关于我">
    <div class="profile-widget">
      <div class="profile-avatar">
        <img src="/avatar.jpg" alt="头像" />
      </div>
      <h3 class="profile-name">花朝九日</h3>
      <div class="profile-mbti">
        <div class="mbti-icon">
          <img src="/src/assets/intj-portrait.svg" alt="INTJ 画像" />
        </div>
        <div class="mbti-info">
          <span class="mbti-type">INTJ-A</span>
          <span class="mbti-label">建筑师</span>
        </div>
      </div>
      <!-- <div class="profile-stats">
        <div class="stat-item">
          <span class="stat-value">{{ articleCount }}</span>
          <span class="stat-label">文章</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ categoryCount }}</span>
          <span class="stat-label">分类</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ visitorCount }}</span>
          <span class="stat-label">访客</span>
        </div>
      </div> -->
      <p class="profile-quote">"我悲喜都 只换来这场 无声的野火"</p>
      
      <div class="contact-section">
        <div class="contact-title">联系方式</div>
        <div class="contact-list">
          <div class="contact-item" @click="copyToClipboard('982086195', 'QQ')">
            <el-icon :size="18"><Message /></el-icon>
            <span class="contact-label">QQ</span>
            <span class="contact-value">982086195</span>
          </div>
          <div class="contact-item" @click="copyToClipboard('FlowerInFire', '微信')">
            <el-icon :size="18"><ChatDotRound /></el-icon>
            <span class="contact-label">微信</span>
            <span class="contact-value">FlowerInFire</span>
          </div>
          <!-- <div class="contact-item" @click="openLink('https://github.com/FlowerInFire')">
            <el-icon :size="18"><Link /></el-icon>
            <span class="contact-label">GitHub</span>
            <span class="contact-value">@FlowerInFire</span>
          </div> -->
          <div class="contact-item" @click="copyToClipboard('982086195@qq.com', '邮箱')">
            <el-icon :size="18"><Message /></el-icon>
            <span class="contact-label">邮箱</span>
            <span class="contact-value">982086195@qq.com</span>
          </div>
        </div>
      </div>
    </div>
  </WidgetCard>
</template>

<script setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { Message, ChatDotRound, Link } from '@element-plus/icons-vue';
import WidgetCard from './WidgetCard.vue';

const articleCount = ref(42);
const categoryCount = ref(8);
const visitorCount = ref(1234);

const copyToClipboard = (text, label) => {
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success(`${label}已复制到剪贴板`);
  }).catch(() => {
    ElMessage.error('复制失败');
  });
};

const openLink = (url) => {
  window.open(url, '_blank');
};
</script>

<style scoped>
.profile-widget {
  text-align: center;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  margin: 0 auto 16px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-name {
  margin: 0 0 12px;
  font-size: 18px;
  font-weight: 600;
  color: white;
}

.profile-mbti {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  margin-bottom: 20px;
}

.mbti-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.15));
  border-radius: 50%;
  color: white;
  flex-shrink: 0;
  overflow: hidden;
}

.mbti-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.mbti-info {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.mbti-type {
  font-size: 14px;
  font-weight: 700;
  color: white;
  letter-spacing: 0.5px;
}

.mbti-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.75);
}

.profile-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
  padding: 16px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: white;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.profile-quote {
  margin: 0 0 20px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  font-style: italic;
  line-height: 1.6;
}

.contact-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
}

.contact-title {
  font-size: 14px;
  font-weight: 600;
  color: white;
  margin-bottom: 12px;
  text-align: center;
}

.contact-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.contact-item {
  display: flex;
  align-items: center;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  transition: all 0.3s ease;
  cursor: pointer;
  gap: 10px;
}

.contact-item:hover {
  background: rgba(255, 255, 255, 0.18);
  transform: translateX(5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.contact-item .el-icon {
  color: rgba(255, 255, 255, 0.9);
  flex-shrink: 0;
}

.contact-item .contact-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  flex-shrink: 0;
  width: 36px;
}

.contact-item .contact-value {
  font-size: 13px;
  color: white;
  font-weight: 500;
  flex: 1;
  text-align: right;
}
</style>
