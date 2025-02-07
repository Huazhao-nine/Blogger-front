<script setup>
import {onMounted, ref} from "vue";
import TopButton from "@/components/TopButton.vue";

const startTime = ref(new Date('2024-12-25T00:00:00'));  // 用于记录开始时间
const runTime = ref('00d 00h 00m 00s');  // 用于显示的运行时间

// 计算时间并更新
const updateRunTime = () => {
  const now = new Date();
  const diff = now - startTime.value;
  // 计算天数、小时、分钟和秒数
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  // 格式化显示时间
  runTime.value = `${days}d ${hours}h ${minutes}m ${seconds}s`;
};

onMounted(() => {
  setInterval(updateRunTime, 1000);
});
</script>

<template>
  <div class="pinned-badge">
    网站已运行：{{ runTime }}
  </div>
</template>

<style scoped>
.pinned-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #ff4747;
  color: white;
  padding: 5px 10px;
  font-size: 12px;
  border-radius: 25px;
  font-weight: bold;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}
</style>