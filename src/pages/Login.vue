<script setup>
import {onMounted, onUnmounted, ref} from 'vue';
import {ElButton, ElForm, ElFormItem, ElInput, ElNotification} from "element-plus";
import 'highlight.js/styles/atom-one-light.css'; // 在此引入高亮样式
import WallpaperCard from "@/components/WallpaperCard.vue";
import {useRouter} from "vue-router";
import {login, sendValidateCode} from "@/api/UserService.js";
import {useAuthStore} from "@/stores/auth.js";
import AboutMe from "@/components/AboutMe.vue"; // 引入 useRoute 来访问路由信息

const startY = ref(0);
const currentY = ref(0);
const isDragging = ref(false);
const maxScroll = ref(0);
// 滑动事件处理
const onTouchStart = (event) => {
  startY.value = event.touches[0].pageY - currentY.value;
  isDragging.value = true;
};
const onTouchMove = (event) => {
  if (!isDragging.value) return;
  currentY.value = event.touches[0].pageY - startY.value;
  if (currentY.value > 0) {
    currentY.value /= 2;
  } else if (currentY.value < maxScroll.value) {
    currentY.value = maxScroll.value + (currentY.value - maxScroll.value) / 2;
  }
  const articleList = document.querySelector('.article-list');
  articleList.style.transform = `translateY(${currentY.value}px)`;
};
const onTouchEnd = () => {
  if (!isDragging.value) return;
  isDragging.value = false;
  if (currentY.value > 0) {
    currentY.value = 0;
  } else if (currentY.value < maxScroll.value) {
    currentY.value = maxScroll.value;
  }
  const articleList = document.querySelector('.article-list');
  articleList.style.transition = 'transform 0.3s ease';
  articleList.style.transform = `translateY(${currentY.value}px)`;
  setTimeout(() => {
    articleList.style.transition = '';
  }, 300);
};


const formData = ref({
  name: '',
  email: '',
  validateCode: '',
  password: '',
});
ref('');
// 绑定输入框的值
const validateCodeText = ref('发送验证码');
const isValidateCodeDisabled = ref(false);
const isSubmitting = ref(false);
let timer = null;
let countdown = 1800;
const auth = useAuthStore()
const router = useRouter()
const loginStatus = ref(false)
const isLogin = () => {
  if (auth.isAuthenticated){
    loginStatus.value = true
    ElNotification({
      title: auth.user.name + '，欢迎',
      message:'点击图片可退出登录',
      type: 'success',
    });
  }
}
const userLogout = () => {
  auth.logout()
  loginStatus.value = false
  ElNotification({
    title: '成功',
    message:'已退出登录',
    type: 'success',
  });
  router.push('/')
}
// 发送验证码
const sendValidate = async () => {
  if (!formData.value.email) {
    ElNotification({
      title: '错误',
      message: '邮箱不能为空！',
      type: 'error',
    });
    isSubmitting.value = false;
    return;
  }
  if (isValidateCodeDisabled.value) return;
  const res = await sendValidateCode(formData.value.email + '@qq.com')
  if (res.data.code === 200){
    ElNotification({
      title: '成功',
      message: res.data.msg,
      type: 'success',
    });
    isValidateCodeDisabled.value = true;
    validateCodeText.value = `${countdown}s后重发`;

    timer = setInterval(() => {
      countdown--;
      validateCodeText.value = `${countdown}s后重发`;

      if (countdown === 0) {
        clearInterval(timer);
        isValidateCodeDisabled.value = false;
        validateCodeText.value = '发送验证码';
        countdown = 1800;
      }
    }, 1000);
  }
  else {
    ElNotification({
      title: '错误',
      message: res.data.msg,
      type: 'error',
    });
  }
};

// 提交登录
const submitLogin = async () => {
  if (isSubmitting.value) return; // 防止重复提交
  isSubmitting.value = true;

  // 校验表单数据
  if (!formData.value.name) {
    ElNotification({
      title: '错误',
      message: '用户名不能为空！',
      type: 'error',
    });
    isSubmitting.value = false;
    return;
  }
  if (!formData.value.email) {
    ElNotification({
      title: '错误',
      message: '邮箱不能为空！',
      type: 'error',
    });
    isSubmitting.value = false;
    return;
  }
  if (!formData.value.validateCode) {
    ElNotification({
      title: '错误',
      message: '验证码不能为空！',
      type: 'error',
    });
    isSubmitting.value = false;
    return;
  }

  if (!formData.value.password) {
    ElNotification({
      title: '错误',
      message: '密码不能为空！',
      type: 'error',
    });
    isSubmitting.value = false;
    return;
  }

  // 模拟登录逻辑
  const res = await login(formData.value)
  if (res.data.code === 200){
    ElNotification({
      title: '成功',
      message: res.data.msg,
      type: 'success',
    });
    // console.log(res.data.data)
    auth.setToken(res.data.data.token);  // 存储 token
    auth.setUser(res.data.data);    // 存储用户信息
    // 重定向到首页或其他页面
    await router.push('/')
  }
  else {
    ElNotification({
      title: '错误',
      message: res.data.msg,
      type: 'error',
    });
  }
  isSubmitting.value = false;
};


onMounted(() => {
  isLogin()
});

onUnmounted(() => {
});


</script>
<template>
  <div class="home">
    <!-- 顶部轮换壁纸 -->
    <wallpaper-card @click="userLogout" v-if="loginStatus"/>
    <wallpaper-card v-else title="用户登录"/>
    <!-- 瀑布流文章列表 -->
    <div
        v-if="!loginStatus"
        class="article-list"
        ref="articleList"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
    >
      <div
          class="article-card"
      >
        <div class="article-content">
          <el-form :model="formData" label-width="100px" class="login-form">
            <!-- 用户名 -->
            <el-form-item label="用户名" :rules="[ { required: true, message: '请输入用户名', trigger: 'blur' } ]">
              <el-input v-model="formData.name" placeholder="请输入用户名" />
            </el-form-item>

            <!-- QQ邮箱 -->
            <el-form-item label="邮箱" :rules="[ { required: true, message: '请输入邮箱', trigger: 'blur' }, { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' } ]">
              <el-input v-model="formData.email"  placeholder="请输入邮箱" >
                <template #append>@qq.com</template>
              </el-input>
            </el-form-item>

            <!-- 邮箱验证码 -->
            <el-form-item label="邮箱验证码" :rules="[ { required: true, message: '请输入验证码', trigger: 'blur' } ]">
              <div class="validateCode-container">
                <el-input class="validateCode-input" v-model="formData.validateCode" placeholder="请输入验证码" />
                <el-button :disabled="isValidateCodeDisabled" @click="sendValidate" class="validateCode-btn">{{ validateCodeText }}</el-button>
              </div>
            </el-form-item>

            <!-- 密码 -->
            <el-form-item label="密码" :rules="[ { required: true, message: '请输入密码', trigger: 'blur' } ]">
              <el-input v-model="formData.password" type="password" placeholder="请输入密码" />
            </el-form-item>

            <!-- 登录按钮 -->
            <el-form-item>
              <el-button :loading="isSubmitting" type="primary" @click="submitLogin" round>注册/登录</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
    <about-me v-else/>

  </div>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
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
.article-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
  margin-top: 25px;
  overflow: hidden; /* 隐藏滚动条 */
  align-items: center;
  will-change: transform;
  transition: transform 0.1s ease;
}
.article-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
  margin-top: 25px;
  align-items: center;
  will-change: transform;
  transition: transform 0.1s ease;
}
.article-card {
  width: 100%; /* 使文章卡片宽度为 100% */
  max-width: 1000px; /* 设置文章卡片最大宽度（调整为适合屏幕的宽度） */
  display: flex;
  flex-direction: column;
  border-radius: 25px;
  overflow: hidden;
  margin-bottom: 25px; /* 卡片之间的间距 */
  background-color: #FFFFFE; /* 白色背景 */
  box-shadow: 0 15px 20px rgba(0, 0, 0, 0.1); /* 细微阴影 */
  transition: transform 0.1s ease, box-shadow 0.1s ease; /* 动画效果 */
}
.article-card:hover {
  transform: translateY(-8px); /* 悬停时微微上浮 */
  box-shadow: 0 15px 25px rgba(0, 0, 0, 0.15); /* 增强阴影效果 */
}
.article-content {
  padding: 20px;
  font-size: 1.0em;
}

/* 使邮箱验证码输入框和按钮在同一行显示 */
.validateCode-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.validateCode-input {
  width: 60%; /* 控制输入框宽度 */
}

.validateCode-btn {
  width: 40%; /* 控制按钮宽度 */
  margin-left: 10px;
}
</style>