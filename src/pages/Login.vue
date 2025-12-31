<template>
  <div class="home">
    <!-- 顶部轮换壁纸 -->
    <wallpaper-card @click="userLogout" v-if="loginStatus"/>
    <wallpaper-card v-else title="用户登录"/>
    <!-- 瀑布流文章列表 -->
    <div
        v-if="!loginStatus"
        class="article-list"
        ref="articleListRef"
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
            <el-button :loading="isSubmitting" @click="submitLogin" round style="width: 100%">注册/登录</el-button>
            <!-- 修改模板部分 -->
            <el-divider content-position="center">其他登录方式</el-divider>
            <div class="social-login">
              <a class="social-btn qq" href="#" @click.prevent="handleQQLogin">
                <span id="qqLoginBtn">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="#50C8FD"><path fill-rule="evenodd" d="M12.003 2c-2.265 0-6.29 1.364-6.29 7.325v1.195S3.55 14.96 3.55 17.474c0 .665.17 1.025.281 1.025.114 0 .902-.483 1.748-2.072 0 0-.18 2.197 1.904 3.967 0 0-1.77.495-1.77 1.182 0 .686 4.078.43 6.29 0 2.239.425 6.288.687 6.288 0 0-.688-1.77-1.182-1.77-1.182 2.086-1.77 1.906-3.967 1.906-3.967.845 1.588 1.634 2.072 1.746 2.072.111 0 .283-.36.283-1.025 0-2.514-2.165-6.954-2.165-6.954V9.325C18.29 3.364 14.268 2 12.003 2Z"/></svg>
              </span>
              </a>
              <a class="social-btn wechat" href="#" @click.prevent="handleWechatLogin">
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path fill="#07C160" d="M20.314 18.59c1.333-.968 2.186-2.397 2.186-3.986 0-2.91-2.833-5.27-6.325-5.27-3.494 0-6.325 2.36-6.325 5.27 0 2.911 2.831 5.271 6.325 5.271.698.001 1.393-.096 2.064-.288l.186-.029c.122 0 .232.038.336.097l1.386.8.12.04a.21.21 0 0 0 .212-.211l-.034-.154-.285-1.063-.023-.135a.42.42 0 0 1 .177-.343ZM9.09 3.513C4.9 3.514 1.5 6.346 1.5 9.84c0 1.905 1.022 3.622 2.622 4.781a.505.505 0 0 1 .213.412l-.026.16-.343 1.276-.04.185c0 .14.113.254.252.254l.146-.047 1.663-.96a.793.793 0 0 1 .403-.116l.222.032c.806.231 1.64.348 2.478.348l.417-.01a4.888 4.888 0 0 1-.255-1.55c0-3.186 3.1-5.77 6.923-5.77l.411.011c-.57-3.02-3.71-5.332-7.494-5.332Zm4.976 10.248a.843.843 0 1 1 0-1.685.843.843 0 0 1 0 1.684v.001Zm4.217 0a.843.843 0 1 1 0-1.685.843.843 0 0 1 0 1.684v.001ZM6.561 8.827a1.012 1.012 0 1 1 0-2.023 1.012 1.012 0 0 1 0 2.023Zm5.061 0a1.012 1.012 0 1 1 0-2.023 1.012 1.012 0 0 1 0 2.023Z"/></svg>
              </a>
            </div>
            <el-form-item>
            </el-form-item>
          </el-form>
        </div>

      </div>
    </div>
    <about-me v-else/>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import WallpaperCard from "@/components/WallpaperCard.vue";
import {onBeforeRouteUpdate, useRoute, useRouter} from "vue-router";
import {login, QQLogin, sendValidateCode} from "@/api/UserService.js";
import { useAuthStore } from "@/stores/auth.js";
import AboutMe from "@/components/AboutMe.vue";
import { useDraggable } from "@/api/useTouchScroll.js";

const formData = ref({
  name: '',
  email: '',
  validateCode: '',
  password: '',
});

const validateCodeText = ref('发送验证码');
const isValidateCodeDisabled = ref(false);
const isSubmitting = ref(false);
let timer = null;
let countdown = 1800;
const auth = useAuthStore();
const router = useRouter();
const loginStatus = ref(false);

const isLogin = () => {
  if (auth.isAuthenticated) {
    loginStatus.value = true;
    ElNotification({
      title: auth.user.name + '，欢迎',
      message: '点击图片可退出登录',
      type: 'success',
    });
  }
};

const userLogout = () => {
  auth.logout();
  loginStatus.value = false;
  ElNotification({
    title: '成功',
    message: '已退出登录',
    type: 'success',
  });
  router.back();
};

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
  const res = await sendValidateCode(formData.value.email + '@qq.com');
  if (res.code === 200) {
    ElNotification({
      title: '成功',
      message: res.msg,
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
  } else {
    ElNotification({
      title: '错误',
      message: res.msg,
      type: 'error',
    });
  }
};

const submitLogin = async () => {
  if (isSubmitting.value) return;
  isSubmitting.value = true;

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

  const res = await login(formData.value);
  if (res.code === 200) {
    ElNotification({
      title: '成功',
      message: res.msg,
      type: 'success',
    });
    auth.setToken(res.data.token);
    auth.setUser(res.data);
    await router.back();
  } else {
    ElNotification({
      title: '错误',
      message: res.msg,
      type: 'error',
    });
  }
  isSubmitting.value = false;
};

const articleListRef = ref(null);

const handleQQLogin = async () => {
  window.open('https://graph.qq.com/oauth2.0/authorize?response_type=code&client_id=102693273&redirect_uri=https://flowerinfire.com/%23/About&state=Huazhao', '_self'); // 在当前标签页中打开
};

const handleWechatLogin = () => {
  ElNotification({
    title: '微信登录暂未适配',
    message: '请等待后续适配',
    type: 'warning',
  });
};

const {calculateMaxScroll, bindTouchEvents, unbindTouchEvents} = useDraggable(articleListRef);

onMounted(() => {
  calculateMaxScroll();
  bindTouchEvents();
  window.addEventListener('resize', calculateMaxScroll);

  isLogin();
});

onUnmounted(() => {
  unbindTouchEvents();
  window.removeEventListener('resize', calculateMaxScroll);
  // 清除倒计时定时器
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
});
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
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
  width: 100%;
  max-width: 1000px;
  display: flex;
  flex-direction: column;
  border-radius: 25px;
  overflow: hidden;
  margin-bottom: 25px;
  background-color: #FFFFFE;
  box-shadow: 0 15px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}

.article-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 25px rgba(0, 0, 0, 0.15);
}

.article-content {
  padding: 20px;
  font-size: 1.0em;
}

.validateCode-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.validateCode-input {
  width: 60%;
}

.validateCode-btn {
  width: 40%;
  margin-left: 10px;
}

.social-login {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin: 20px 0;
}

.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #FFFFFE;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.social-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.social-btn.wechat:hover {
  background: #FFFFFE;
}

.social-btn.qq:hover {
  background: #FFFFFE;
}

.social-btn svg {
  transition: transform 0.2s ease;
}

.social-btn:hover svg {
  transform: scale(1.1);
}
</style>