<template>
  <div class="home">
    <!-- 顶部轮换壁纸 -->
    <div class="header" :style="{ backgroundImage: `url(${wallpaperUrl})` }">
      <time-button/>
      <div class="header-content">
        <!-- 左边头像 -->
        <img class="avatar" @click="userLoginAndOut"  src="/src/assets/avatar.jpg" alt="头像" v-if="!auth.isAuthenticated"/>
        <img class="avatar" @click="userLoginAndOut" :src="imageData" alt="QQ Avatar" v-else/>
        <!-- 竖线 -->
        <div class="divider"></div>
        <!-- 右边介绍 -->
        <div class="intro">
          <h1 v-if="auth.isAuthenticated">{{ auth.user.name }}</h1>
          <h1 v-else>未登录，点击头像登录</h1>
          <p>悟已往之不谏，知来者之可追。</p>
        </div>
      </div>
    </div>
    <!-- 瀑布流文章列表 -->
    <about-me></about-me>
  </div>
</template>
<script setup>
import {onBeforeUnmount, onMounted, ref} from 'vue';
import {ElFormItem, ElInput, ElMessageBox, ElNotification} from 'element-plus';
import {fetchWallpaper, getWallPaper} from '@/api/WallpaperService.js';
import AboutMe from "@/components/AboutMe.vue";
import {useRoute, useRouter} from "vue-router";
import TimeButton from "@/components/TimeButton.vue";
import {useAuthStore} from "@/stores/auth.js";
import {getQQAvatar} from "@/api/QQService.js";
import axios from "axios";
import request from "@/api/request.js";
import {getUserByopenid, QQLogin} from "@/api/UserService.js";
const auth = useAuthStore()
const email = ref('')
const wallpaperUrl = ref('');
const router = useRouter()
const imageData = ref('')

const getUserImg = async () => {
  if (auth.isAuthenticated){
    const res = await getQQAvatar(auth.user.email)
    imageData.value = 'data:image/jpeg;base64,' +  res.data.msg
  }
}

const isPhone = ref(true)
// 检测设备类型
const checkDeviceType = () => {
  if (window.innerWidth > 768) {
    isPhone.value = false
    ElNotification({
      title: '页面暂未适配',
      message: '当前页面暂未适配桌面端，请使用移动端设备进行浏览获得最佳效果。',
      type: 'warning',
    });
  }else isPhone.value = true
};
const isLogin = () => {
  if (auth.isAuthenticated){
    ElMessage.success('点击头像可退出登录')
  }
}
const userLoginAndOut = () => {
  if (auth.isAuthenticated){
    ElMessageBox.alert('确定要退出登录吗', '确认退出', {
      // if you want to disable its autofocus
      // autofocus: false,
      confirmButtonText: 'OK',
      customStyle: {
        borderRadius: '25px',  // 设置圆角为 25px
      },
      callback: (action) => {
        if (action === 'confirm'){
          auth.logout()
          ElNotification({
            title: '成功',
            message:'已退出登录',
            type: 'success',
          });
          router.back()
        }
      },
    })
  }else {
    router.push('/Login')
  }
}
const route = useRoute();// 获取当前路由信息
const checkLoginStatus = async () => {
  let code = route.query.code;
  if (code !== undefined){
  const redirectUri = encodeURIComponent('https://flowerinfire.com/#/About');

  const url = `/qqLogin/token?grant_type=authorization_code&` +
      `client_id=102693273&` +
      `client_secret=ypZN6f5IKF1gDamq&` +
      `code=${code}&` +
      `redirect_uri=${redirectUri}&` +
      `fmt=json&` +
      `need_openid=1`;

  const res = await axios.get(url);
  // console.log(res.data.openid);
  const openidRes = await getUserByopenid(res.data.openid);
    console.log(openidRes);
     if (openidRes.data.code !== 200) {
    ElMessageBox.prompt('请输入你想要接受消息的邮箱', 'QQ绑定', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      inputPattern:
          /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/,
      inputErrorMessage: '邮箱不合理',
    })
        .then(async ({value}) => {
          const QQLoginPak = {
            oauth_consumer_key: 102693273,
            access_token: res.data.access_token,
            openid: res.data.openid,
            format: "json",
            email: value,
          }
          ElNotification({
            title: '邮箱绑定成功',
            message: `你的初始账号密码均为:${value}`,
            type: 'success',
          });
          const QQRes = await QQLogin(QQLoginPak);
          console.log(QQRes);
          if (QQRes.data.code === 200) {
            ElNotification({
              title: '成功',
              message: QQRes.data.msg,
              type: 'success',
            });
            auth.setToken(QQRes.data.data.token);
            auth.setUser(QQRes.data.data);
            await router.push('/About');
            router.go(0);
          } else {
            ElNotification({
              title: '错误',
              message: res.data.msg,
              type: 'error',
            });
          }
        })
  }else {
       // ElNotification({
       //   title: '成功',
       //   message: '登录成功',
       //   type: 'success',
       // });
       auth.setToken(openidRes.data.data.token);
       auth.setUser(openidRes.data.data);
       await router.push('/About');
       router.go(0);
     }

  }

};

// 生命周期钩子
onMounted(() => {
  checkLoginStatus();
  fetchWallpaper(wallpaperUrl);
  checkDeviceType(); // 初次加载时检查设备
  getUserImg()
  isLogin()
  // window.addEventListener('resize', checkDeviceType); // 窗口大小变化时重新检查
});

onBeforeUnmount(() => {
});
</script>
<style scoped>
.home {
  display: flex;
  flex-direction: column;
}
.header {
  border-radius: 25px; /* 设置更平滑的圆角 */
  overflow: hidden; /* 确保圆角生效 */
  background-size: cover; /* 背景图自动覆盖 */
  background-position: center; /* 居中背景图 */
  height: 150px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

/* 内部左右布局容器 */
.header-content {
  display: flex;
  align-items: center;
  width: 90%; /* 根据需要调整宽度 */
  max-width: 1000px; /* 限制最大宽度 */
  margin: 0 auto;
}

/* 左侧头像样式 */
.avatar {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  margin-right: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  object-fit: cover;
  border: 3px solid rgba(255, 255, 255, 0.8); /* 添加白色边框 */
  background: linear-gradient(135deg, #f093fb, #f5576c); /* 添加渐变背景 */
}
.avatar:hover {
  transform: rotate(360deg);
  transition: transform 0.6s ease-in-out;
}


/* 竖线样式 */
.divider {
  width: 5px; /* 设置竖线宽度 */
  height: 60%; /* 设置竖线高度，相对头像和文字的高度 */
  background-color: rgba(255, 255, 255, 0.7); /* 设置竖线颜色和透明度 */
  margin: 0 20px; /* 设置竖线与左右内容之间的间距 */
}

/* 右侧介绍样式 */
.intro h1 {
  animation: fadeIn 0.5s ease-in-out;
  margin: 0;
  font-size: 20px; /* 标题字体大小 */
  font-weight: bold;
}

.intro p {
  animation: fadeIn 1s ease-in-out;
  margin: 8px 0 0; /* 段落间距 */
  font-size: 12px; /* 描述字体大小 */
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}


.categories a {
  display: block;
  margin: 10px 0;
  color: #333;
  text-decoration: none;
  font-size: 18px;
  font-weight: 500;
}
.categories a:hover {
  color: #007bff; /* 悬浮时颜色 */
}
.floating-menu ul {
  list-style-type: none;
  margin: 0;
  padding: 0;
}
.floating-menu ul li {
  margin: 8px 0;
  cursor: pointer;
}
.floating-menu ul li:hover {
  color: #007bff; /* 悬浮时改变文字颜色 */
}
</style>

