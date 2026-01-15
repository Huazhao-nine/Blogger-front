<script setup>
import { onBeforeUnmount, onMounted, ref, watch, h, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router'
import { zhCn } from "element-plus/es/locale/index";
import FooterNav from "@/components/FooterNav.vue";
import { useRegisterSW } from 'virtual:pwa-register/vue'
import { ElNotification, ElButton } from 'element-plus'

const router = useRouter()
const route = useRoute() // 获取当前路由对象

const pcModel = ref(true);
const checkPcModel = () => {
  if (window.innerWidth > 768) {
    pcModel.value = false
    if (route.path === '/') {
      router.push('/pc')
    }
  } else {
    pcModel.value = true
    if (route.path === '/pc') {
      router.push('/')
    }
  }
}

// 获取 PWA 更新状态
const { needRefresh, updateServiceWorker } = useRegisterSW({
  onRegisterError(error) {
    console.error('SW 注册失败', error)
  }
})

// 监听更新状态
watch(needRefresh, (value) => {
  console.log('检测到新版本，needRefresh:', value)
  if (value) {
    showUpdateNotification()
  }
})

// 弹窗函数
const showUpdateNotification = () => {
  ElNotification({
    title: '发现新版本',
    // 这里用到了 h 函数，所以必须引入
    message: h('div', null, [
      h('p', { style: 'margin-bottom: 8px' }, '博客内容已更新，点击刷新获取最新体验 🚀'),
      h(ElButton, {
        type: 'success',
        size: 'small',
        round: true,
        onClick: async () => {
          await updateServiceWorker()
        }
      }, () => '立即刷新')
    ]),
    position: 'top-right',
    duration: 0,
    showClose: false,
    customClass: 'pwa-updater',
  })
}

// 定义过渡动画名称
const transitionName = computed(() => {
  return 'slide';
})

onMounted(() => {
  checkPcModel()
  window.addEventListener('resize', checkPcModel)
})
</script>

<template>
  <el-config-provider :locale="zhCn">

    <router-view v-slot="{ Component }">

      <transition :name="transitionName" mode="out-in">

        <component :is="Component" :key="route.fullPath" />

      </transition>
    </router-view>

    <footer-nav v-if="pcModel"></footer-nav>

  </el-config-provider>
</template>

<style scoped>
/* 定义滑动动画效果 */

/* 激活状态 */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.5s ease; /* 建议改为 all，或者 transform, opacity */
}

/* 进入前 & 离开后 */
/* ⚠️ Vue 3 写法是 slide-enter-from，不是 slide-enter */
.slide-enter-from,
.slide-leave-to {
  transform: translateY(20px); /* 向下位移一点，比较优雅 */
  opacity: 0; /* 配合透明度变化，效果更好 */
}

/* 进入后 & 离开前 (正常状态) */
.slide-enter-to,
.slide-leave-from {
  transform: translateY(0);
  opacity: 1;
}
</style>
<style>
/* 针对 PWA 更新弹窗的样式覆盖 */
.el-notification.pwa-updater {
  border-radius: 25px !important; /* 强制圆角 25px */
  border: none; /* 可选：去掉默认边框，看起来更现代 */
  box-shadow: 0 10px 30px rgba(0,0,0,0.15); /* 可选：加深一点阴影，更有悬浮感 */
}

/* 如果你想让里面的“立即刷新”按钮也更协调，可以微调按钮位置 */
.pwa-updater .el-notification__content {
  margin-top: 10px;
}
</style>