<script setup>
import {onMounted, onUnmounted, ref} from 'vue';
import {ElButton, ElForm, ElFormItem, ElInput, ElNotification, ElOption, ElSelect, ElSwitch, ElTag} from "element-plus";
import 'highlight.js/styles/atom-one-light.css'; // 在此引入高亮样式
import WallpaperCard from "@/components/WallpaperCard.vue";
import {addArticle, editArticle, getArticleByID} from "@/api/ArticleService.js";
import {addCategory, getAllCategories} from "@/api/CategoryService.js";
import {useRoute, useRouter} from "vue-router";
import {useAuthStore} from "@/stores/auth.js";
import {useDraggable} from "@/api/useTouchScroll.js"; // 引入 useRoute 来访问路由信息
const articleListRef = ref(null);
const { calculateMaxScroll, bindTouchEvents, unbindTouchEvents } = useDraggable(articleListRef);
const route = useRoute();// 获取当前路由信息
const editedArticle = ref({})
const isAdd = ref(true)
const getArticle = async () => {
  const id = route.params.id;// 从路由参数中提取 articleId
  if (id !== undefined){
    const res = await getArticleByID(id, auth.token);
    if (res.data.code === 200) {
      editedArticle.value = res.data.data;
      articleData.value = res.data.data;
      isAdd.value = false;
    }else {
      ElNotification({
        title: '错误',
        message: '权限不足',
        type: 'error',
      });
      await router.back()
    }
  }
}

const categories = ref([]);
const dialogVisible = ref(false);
const newCategoryName = ref('');
const newCategoryDesc = ref('');
const Categories = ref({})

// 打开新增分类对话框
const handleCategoryChange = (value) => {
  if (!auth.isAuthenticated){
    ElNotification({
      title: '未登录',
      message: '请登录后重试',
      type: 'error',
    });
    return; // 防止重复提交
  }
  if (value === 'newCategory') {
    dialogVisible.value = true;
  }
};

// 关闭新增分类对话框
const closeDialog = () => {
  dialogVisible.value = false;
  newCategoryName.value = ''; // 清空输入框
  newCategoryDesc.value = ''; // 清空输入框
};

// 新增分类
const addCate = async () => {
  if (!newCategoryName.value.trim()) {
    ElNotification({
      title: '错误',
      message: '分类名称不能为空',
      type: 'error',
    });
    return
  }
  if (!newCategoryDesc.value.trim()) {
    ElNotification({
      title: '错误',
      message: '分类描述不能为空',
      type: 'error',
    });
    return
  }
  let category = {
    name: newCategoryName.value,
    instruction: newCategoryDesc.value
  }
  const res = await addCategory(category);
  // console.log(res)
  if (res.data.code === 200) {
    ElNotification({
      title: '成功',
      message: res.data.msg,
      type: 'success',
    });
  }
  else ElNotification({
    title: '错误',
    message: res.data.msg,
    type: 'error',
  });
  await getAll()
  closeDialog()
};

const getAll = async () => {
  const res = await getAllCategories()
  categories.value = res.data.data
  // console.log(categories.value)
}

const isSubmitting = ref(false);
// 创建一个响应式对象 articleData
const articleData = ref({
  title: '',
  slug: '',
  content: '',
  summary: '',
  tags: [],
  categoryName: '',
  pwd: '',
  isPinned: false,
  isHome: false
});

const inputTag = ref('');  // 绑定输入框的值

// 添加标签的方法
const addTag = () => {
  if (inputTag.value.trim() !== '') {
    // console.log(articleData.value)
    articleData.value.tags.push(inputTag.value.trim());  // 添加标签
    inputTag.value = '';  // 清空输入框
  }
};
const router = useRouter()
const auth = useAuthStore()
// 提交文章
const submitArticle = async () => {
  if (isSubmitting.value) return; // 防止重复提交
  if (!auth.isAuthenticated){
    ElNotification({
      title: '未登录',
      message: '请登录后重试',
      type: 'error',
    });
    return; // 防止重复提交
  }
  isSubmitting.value = true;

  // 验证各个字段是否为空
  if (!articleData.value.title) {
    ElNotification({
      title: '错误',
      message: '标题不能为空！',
      type: 'error',
    });
    isSubmitting.value = false;
    return;
  }

  if (!articleData.value.slug) {
    ElNotification({
      title: '错误',
      message: 'Slug不能为空！',
      type: 'error',
    });
    isSubmitting.value = false;
    return;
  }

  if (!articleData.value.content) {
    ElNotification({
      title: '错误',
      message: '内容不能为空！',
      type: 'error',
    });
    isSubmitting.value = false;
    return;
  }

  if (!articleData.value.summary) {
    ElNotification({
      title: '错误',
      message: '摘要不能为空！',
      type: 'error',
    });
    isSubmitting.value = false;
    return;
  }

  // 检查 tags 是否为空或者没有有效标签
  if (!articleData.value.tags || articleData.value.tags.length === 0 || articleData.value.tags.every(tag => !tag)) {
    ElNotification({
      title: '错误',
      message: '请至少添加一个有效的标签！',
      type: 'error',
    });
    isSubmitting.value = false;
    return;
  }

  // if (!articleData.value.pwd) {
  //   ElNotification({
  //     title: '错误',
  //     message: '密码不能为空！',
  //     type: 'error',
  //   });
  //   isSubmitting.value = false;
  //   return;
  // }
  let res
  // 构建提交数据
  if (isAdd.value){
    let articlePayload = {
      userId: auth.user.id,  // 假设用户ID是固定的，可以从登录状态中获取
      title: articleData.value.title,
      slug: articleData.value.slug,
      content: articleData.value.content,
      summary: articleData.value.summary,
      tags: articleData.value.tags,  // 过滤掉空字符串的标签
      categoryName: articleData.value.categoryName,
      isPinned: articleData.value.isPinned ? 1 : 0,
      isHome: articleData.value.isHome ? 1 : 0,
      password: articleData.value.pwd === '' ? '-1' : articleData.value.pwd
    };
    res = await addArticle(articlePayload); // 调用API提交数据}
  }else {
    let pwd = articleData.value.pwd === '' ? '-1' : articleData.value.pwd
    res = await editArticle(editedArticle.value, pwd);
  }
    if (res.data.code === 200) {
      ElNotification({
        title: '成功',
        message: res.data.msg,
        type: 'success',
      });
      // 重置表单
      articleData.value.title = '';
      articleData.value.slug = '';
      articleData.value.content = '';
      articleData.value.summary = '';
      articleData.value.tags = [];  // 重置 tags 为一个空数组
      articleData.value.categoryName = '';
      articleData.value.isPinned = false;
      articleData.value.isHome = false;
      articleData.value.pwd = '';
      await router.back();
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
  calculateMaxScroll(); // 计算最大滚动范围
  bindTouchEvents(); // 绑定触摸事件
  getArticle();
  getAll()
});

onUnmounted(() => {
  unbindTouchEvents()
});


</script>
<template>
  <div class="home">
    <!-- 顶部轮换壁纸 -->
    <wallpaper-card title="编辑文章"/>
    <!-- 瀑布流文章列表 -->
    <div
        class="article-list"
        ref="articleListRef"
    >
      <div
          class="article-card"
      >
        <div class="article-content">
          <el-form :model="articleData" label-width="100px" class="article-form">
            <el-form-item label="标题" :rules="[ { required: true, message: '请输入文章标题', trigger: 'blur' } ]">
              <el-input v-model="articleData.title" placeholder="请输入文章标题" />
            </el-form-item>

            <el-form-item label="Slug" :rules="[ { required: true, message: '请输入文章 Slug', trigger: 'blur' } ]">
              <el-input v-model="articleData.slug" placeholder="请输入文章 Slug" />
            </el-form-item>

            <el-form-item label="内容" :rules="[ { required: true, message: '请输入文章内容', trigger: 'blur' } ]">
              <el-input v-model="articleData.content" type="textarea" :rows="6" placeholder="请输入文章内容" />

            </el-form-item>

            <el-form-item label="摘要" :rules="[ { required: true, message: '请输入文章摘要', trigger: 'blur' } ]">
              <el-input v-model="articleData.summary" type="textarea" :rows="3" placeholder="请输入文章摘要" />
            </el-form-item>

            <el-form-item label="标签">
              <el-input
                  v-model="inputTag"
                  placeholder="输入标签并按回车添加"
                  @keyup.enter="addTag"
              />

              <div class="tags">
                <el-tag v-for="(tag, index) in articleData.tags" :key="index" closable @close="articleData.tags.splice(index, 1)">
                  {{ tag }}
                </el-tag>
              </div>
            </el-form-item>
            <el-form :model="articleData" label-width="100px" class="article-form">
              <!-- 分类选择 -->
              <el-form-item label="分类" :rules="[ { required: true, message: '请选择文章分类', trigger: 'blur' } ]">
                <el-select v-model="articleData.categoryName" placeholder="请选择分类" @change="handleCategoryChange">
                <el-option
                      v-for="category in categories"
                      :key="category.id"
                      :label="category.name"
                      :value="category.name"
                  />
                  <el-option label="新增分类" value="newCategory" />
                </el-select>
              </el-form-item>
              <el-form-item label="密码">
                <el-input v-model="articleData.pwd" placeholder="密码为空表示发布公开文章" />
              </el-form-item>

              <!-- 新增分类输入框 -->
              <el-dialog style="border-radius: 25px" :modal="false" :append-to-body="true" width="80%" v-model="dialogVisible" title="新增分类" @close="closeDialog">
                <el-input v-model="newCategoryName" placeholder="请输入分类名称" />
                <el-input v-model="newCategoryDesc" placeholder="请输入分类描述" style="margin-top: 25px" />
                <template #footer>
                  <el-button @click="closeDialog">取消</el-button>
                  <el-button  @click="addCate">确认</el-button>
                </template>
              </el-dialog>
            </el-form>
            <el-form-item label="置顶">
              <el-switch v-model="articleData.isPinned" active-text="文章置顶" inactive-text="否" />
              <el-switch v-model="articleData.isHome" style="margin-left: 25px"  active-text="主页置顶" inactive-text="否" />
            </el-form-item>
            <el-form-item>
              <el-button :loading="isSubmitting"  @click="submitArticle" round style="width: 100%">提交文章</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

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
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
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
</style>