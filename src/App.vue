<script setup>
import {computed, ref, onMounted} from 'vue' // 确保导入 computed
import {useRoute} from 'vue-router'
import {zhCn} from "element-plus/es/locale/index";
import FooterNav from "@/components/footerNav.vue";
import {ElNotification} from "element-plus";

const route = useRoute()
const pcModel = ref(true);
const checkPcModel = () => {
  if (window.innerWidth > 768) {
    pcModel.value = false
  }else pcModel.value = true
}

// 使用滑动动画
const transitionName = computed(() => {
  return 'slide';
})
onMounted(() => {
  checkPcModel()
})
</script>

<template>
  <router-view v-slot="{ Component }">

  <el-config-provider :locale="zhCn">
    <div>
      <!-- 使用 router-view 的 v-slot 来包裹过渡动画 -->
        <transition :name="transitionName" mode="out-in">
          <component :is="Component" />
        </transition>
      <footer-nav v-if="pcModel"></footer-nav>
    </div>
  </el-config-provider>
  </router-view>
</template>

<style scoped>


/* 定义滑动动画效果 */
.slide-enter-active, .slide-leave-active {
  transition: transform 0.8s ease-in-out;
}

.slide-enter, .slide-leave-to {
  transform: translateY(-100%);
}

</style>
