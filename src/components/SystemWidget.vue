<template>
  <WidgetCard title="系统状态">
    <div class="system-widget">
      <div class="system-item">
        <div class="system-label">CPU 使用率</div>
        <div class="system-progress">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: cpuUsage + '%' }"></div>
          </div>
          <span class="progress-value">{{ cpuUsage }}%</span>
        </div>
      </div>
      <div class="system-item">
        <div class="system-label">内存使用率</div>
        <div class="system-progress">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: memoryUsage + '%' }"></div>
          </div>
          <span class="progress-value">{{ memoryUsage }}%</span>
        </div>
      </div>
      <div class="system-item">
        <div class="system-label">磁盘使用率</div>
        <div class="system-progress">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: diskUsage + '%' }"></div>
          </div>
          <span class="progress-value">{{ diskUsage }}%</span>
        </div>
      </div>
      <div class="system-info">
        <p class="info-item">CPU 温度: {{ cpuTemp }}°C</p>
        <p class="info-item">运行时间: {{ uptime }}</p>
      </div>
    </div>
  </WidgetCard>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import WidgetCard from './WidgetCard.vue';

const cpuUsage = ref(45);
const memoryUsage = ref(62);
const diskUsage = ref(78);
const cpuTemp = ref(42);
const uptime = ref('3天 5小时');

let timer = null;

const updateSystemInfo = () => {
  cpuUsage.value = Math.floor(Math.random() * 30 + 30);
  memoryUsage.value = Math.floor(Math.random() * 20 + 50);
  cpuTemp.value = Math.floor(Math.random() * 10 + 38);
};

onMounted(() => {
  timer = setInterval(updateSystemInfo, 5000);
});

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});
</script>

<style scoped>
.system-widget {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.system-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.system-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.system-progress {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.9));
  border-radius: 4px;
  transition: width 0.5s ease;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}

.progress-value {
  font-size: 14px;
  font-weight: 600;
  color: white;
  min-width: 40px;
  text-align: right;
}

.system-info {
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.info-item {
  margin: 6px 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
}
</style>
