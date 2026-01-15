<template>
  <WidgetCard title="网站运行时间">
    <div class="runtime-widget">
      <div class="runtime-display">
        <div class="runtime-item">
          <span class="runtime-value">{{ runtime.days }}</span>
          <span class="runtime-unit">天</span>
        </div>
        <div class="runtime-item">
          <span class="runtime-value">{{ runtime.hours }}</span>
          <span class="runtime-unit">时</span>
        </div>
        <div class="runtime-item">
          <span class="runtime-value">{{ runtime.minutes }}</span>
          <span class="runtime-unit">分</span>
        </div>
        <div class="runtime-item">
          <span class="runtime-value">{{ runtime.seconds }}</span>
          <span class="runtime-unit">秒</span>
        </div>
      </div>
      <div class="runtime-info">
        <p>网站已稳定运行</p>
        <p class="runtime-start">始于 2024-12-25</p>
      </div>
    </div>
  </WidgetCard>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import WidgetCard from './WidgetCard.vue';

const startTime = new Date('2024-12-25T00:00:00');
const runtime = ref({
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0
});

let timer = null;

const updateRuntime = () => {
  const now = new Date();
  const diff = now - startTime;
  
  runtime.value.days = Math.floor(diff / (1000 * 60 * 60 * 24));
  runtime.value.hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  runtime.value.minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  runtime.value.seconds = Math.floor((diff % (1000 * 60)) / 1000);
};

onMounted(() => {
  updateRuntime();
  timer = setInterval(updateRuntime, 1000);
});

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});
</script>

<style scoped>
.runtime-widget {
  text-align: center;
}

.runtime-display {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
}

.runtime-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.runtime-value {
  font-size: 28px;
  font-weight: 700;
  color: white;
  line-height: 1;
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.runtime-unit {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.runtime-info p {
  margin: 4px 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.runtime-start {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}
</style>
