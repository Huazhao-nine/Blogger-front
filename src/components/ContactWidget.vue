<template>
  <WidgetCard title="联系方式">
    <div class="contact-widget">
      <div class="contact-item">
        <div class="contact-icon">📧</div>
        <div class="contact-info">
          <span class="contact-label">QQ</span>
          <span class="contact-value">982086195</span>
        </div>
      </div>
      <div class="contact-item">
        <div class="contact-icon">💬</div>
        <div class="contact-info">
          <span class="contact-label">WeChat</span>
          <span class="contact-value">FlowerInFire</span>
        </div>
      </div>
      <div class="contact-item">
        <div class="contact-icon">🌐</div>
        <div class="contact-info">
          <span class="contact-label">GitHub</span>
          <span class="contact-value">@FlowerInFire</span>
        </div>
      </div>
      <div class="contact-item">
        <div class="contact-icon">📧</div>
        <div class="contact-info">
          <span class="contact-label">Email</span>
          <span class="contact-value">982086195@qq.com</span>
        </div>
      </div>
    </div>
  </WidgetCard>
</template>

<script setup>
import WidgetCard from './WidgetCard.vue';
</script>

<style scoped>
.contact-widget {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.contact-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.contact-item:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateX(5px);
}

.contact-icon {
  font-size: 24px;
  margin-right: 12px;
}

.contact-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.contact-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 2px;
}

.contact-value {
  font-size: 14px;
  color: white;
  font-weight: 500;
}
</style>
