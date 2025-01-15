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
  <top-button :desc="'已运行：' + runTime" :is-pinned="true"></top-button>
</template>

<style scoped>

</style>