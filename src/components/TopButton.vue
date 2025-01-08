<template>
  <div v-if="isPinned" class="pinned-badge">
    {{ desc }}
  </div>
</template>

<script setup>
import {defineProps} from 'vue';

defineProps({
  isPinned: {
    type: Boolean,
    default: false,
  },
  desc: {
    type: String,
    required: true,
  }
});
</script>

<style scoped>
.pinned-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #ff4747;
  color: white;
  padding: 5px 10px;
  font-size: 12px;
  border-radius: 12px;
  font-weight: bold;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}
</style>
