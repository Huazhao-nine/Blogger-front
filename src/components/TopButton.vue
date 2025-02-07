<template>
  <div v-if="isPinned && locked" class="pinned-badge">
    🔒{{ desc }}
  </div>
  <div v-else-if="isPinned" class="pinned-badge">
    {{ desc }}
  </div>
  <div v-else-if="locked" class="pinned-badge">
    🔒
  </div>
</template>

<script setup>
import {defineProps, onMounted, computed, ref} from 'vue';

const props = defineProps({
  isPinned: {
    type: Boolean,
    default: false,
  },
  locked:{
    type: Boolean,
    default: false,
  },
  desc: {
    type: String,
    required: true,
  }
});

onMounted(() => {
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
  border-radius: 25px;
  font-weight: bold;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}
</style>
