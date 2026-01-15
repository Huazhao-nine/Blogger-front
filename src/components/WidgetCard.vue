<template>
  <div class="widget-card glass-card">
    <div class="widget-header">
      <h4 class="widget-title">{{ title }}</h4>
    </div>
    <div class="widget-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: 'Widget'
  }
});
</script>

<style scoped>
.widget-card {
  margin-bottom: 20px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
}

.widget-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.widget-header {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.widget-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: white;
}

.widget-content {
  padding: 20px;
}
</style>
