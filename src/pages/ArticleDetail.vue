<script setup>
import {nextTick, onMounted, onUnmounted, ref} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {getArticleByID} from "@/api/ArticleService.js";
import {ElNotification} from "element-plus";
import {fetchWallpaper} from "@/api/WallpaperService.js";
import {Clock, Postcard, User, View} from "@element-plus/icons-vue";
import {marked} from "marked";
import katex from "katex";
import 'katex/dist/katex.min.css'; // 导入 KaTeX 的样式
import 'highlight.js/styles/atom-one-light.css'; // 在此引入高亮样式
import hljs from "highlight.js";
import TopButton from "@/components/TopButton.vue";
import {useAuthStore} from "@/stores/auth.js";
import {isAuthor} from "@/api/UserService.js";
import {useDraggable} from "@/api/useTouchScroll.js";
import {formatDate} from "../api/globals.js";
import Bookmark from "@/components/Bookmark.vue"; // 引入 useRoute 来访问路由信息
const articlesLoading = ref(false)
const route = useRoute();// 获取当前路由信息
const article = ref({})
const getArticle = async () => {
  articlesLoading.value = true
  const id = route.params.id;// 从路由参数中提取 articleId
  const res = await getArticleByID(id);
  article.value = res.data.data
  await getMarkdownContent()
  articlesLoading.value = false
}

const bookmarkStatus = ref(false)
const selection = ref('')
// 监听用户复制事件
const onCopy = async () => {
  selection.value = await navigator.clipboard.readText();
  bookmarkStatus.value = true
};



const articleListRef = ref(null);
const { calculateMaxScroll, bindTouchEvents, unbindTouchEvents } = useDraggable(articleListRef);



onMounted(() => {
  getArticle();
  fetchWallpaper(wallpaperUrl);
  checkDeviceType();  // 初始化检测设备类型
  calculateMaxScroll(); // 计算最大滚动范围
  bindTouchEvents(); // 绑定触摸事件
  document.addEventListener("copy", onCopy);

  window.addEventListener('resize', calculateMaxScroll);
  window.addEventListener('resize', checkDeviceType); // 添加监听器以动态检测设备类型
});

onUnmounted(() => {
  unbindTouchEvents()
  document.removeEventListener("copy", onCopy);
  window.removeEventListener('resize', checkDeviceType); // 清除监听器
});


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

const wallpaperUrl = ref('');
const htmlContent = ref()
const getMarkdownContent = async () => {
  // 定义自定义渲染器
  const renderer = new marked.Renderer();
  // 自定义图片渲染器
  renderer.image = ({ href, title, text }) => {
    console.log(href)
    // 如果图片路径是相对路径，补充上根路径
    // if (!/^http?:\/\//.test(href)) {
    //   href = `/images/${href}`;  // 假设图片存放在 public/images 目录下
    // }
    // 返回带有 src、alt、title 和内联样式的 <img> 标签
    return `<img src="${href}" alt="${text}" title="${title}" style="max-width: 100%; height: auto; display: block; margin: 0 auto;" />`;
  };


  // 配置 marked 的选项
  const markedOptions = {
    gfm: true,
    breaks: true,
    renderer: renderer,  // 使用自定义的渲染器
  };

  // 设置 marked 配置
  marked.setOptions(markedOptions);
  // marked.use({renderer: renderer})
  // 使用 marked 渲染文章内容

  const rawContent = article.value.content;
  // console.log("Raw Markdown Content:", rawContent);  // 输出原始 Markdown 内容
  // 渲染为 HTML
  htmlContent.value = marked(rawContent);
  // htmlContent.value = marked.parse(rawContent);
  // 调试：查看渲染后的 HTML
  // console.log("Rendered HTML:", htmlContent.value);
  // 替换其中的 LaTeX 公式（如果有）
  replaceLatexWithClass();
  // 等待 DOM 更新完毕后，再执行后续操作
  await nextTick();
  // 延迟渲染 LaTeX 公式，确保 HTML 渲染完毕
  // 延迟执行代码高亮
  setTimeout(() => {
    renderLatex();
    hljs.highlightAll();
  }, 50);
};

// 替换 htmlContent 中的 LaTeX 公式
const replaceLatexWithClass = () => {
  // 替换 $$ ... $$ 为 .math 类
  htmlContent.value = htmlContent.value.replace(/\$\$([\s\S]+?)\$\$/g, (match, latex) => {
    // 移除所有 <br> 标签和多余的空格
    latex = latex.replace(/<br>/g, ' ').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
    return `<span class="math">${latex}</span>`;
  });

  // 替换 \( ... \) 为 .inline-math 类
  htmlContent.value = htmlContent.value.replace(/\\\(([\s\S]+?)\\\)/g, (match, latex) => {
    latex = latex.replace(/<br>/g, ' ').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
    return `<span class="inline-math">${latex}</span>`;
  });
};

const renderLatex = () => {
  // 查找所有包含 LaTeX 公式的元素（即 .math 类）
  const mathElements = document.querySelectorAll('.math');

  mathElements.forEach((element) => {
    // 使用 KaTeX 渲染公式
    katex.render(element.textContent, element, {
      throwOnError: false,  // 如果公式有错误，不抛出异常
    });
  });
};
const reFresh = () => {
  bookmarkStatus.value = false
  getMarkdownContent()
}
const router = useRouter()
const auth = useAuthStore()
const edit = async () => {
  if (!auth.isAuthenticated){
    ElNotification({
      title: '未登录',
      message: '请登录后重试',
      type: 'error',
    });
    return; // 防止重复提交
  }
  const res = await isAuthor(article.value, auth.user.id)
  if (res.data.code === 200) {
    await router.push(`/Edit/${article.value.id}`);
  }else {
    ElNotification({
      title: '错误',
      message: res.data.msg,
      type: 'error',
    });
  }

};

</script>
<template>
  <div v-if="bookmarkStatus">
    <h3 class="preview-container" @click = "reFresh">书签预览(点我关闭)</h3>
    <bookmark :article="article" :selection="selection"></bookmark>
  </div>
  <div v-else>
  <div class="home" v-if="isPhone">
    <!-- 顶部轮换壁纸 -->
    <div @click="edit" class="header" :style="{ backgroundImage: `url(${wallpaperUrl})` }">
      <top-button :isPinned="article.isPinned" desc="置顶中" />
      <h2 >{{article.title}}</h2>
      <div class="article-meta">
        <div class="views">
          <el-icon><Postcard /></el-icon>
          {{article.categoryName}}
        </div>
        <div class="author">
          <el-icon><View /></el-icon>
          {{article.viewCount}}
        </div>
        <div class="author">
          <el-icon><User /></el-icon>
          {{article.authorName}}
        </div>
        <div class="date">
          <el-icon><Clock /></el-icon>
          {{ formatDate(article.publishedAt) }}
        </div>
      </div>

    </div>
    <!-- 瀑布流文章列表 -->
    <div
        class="article-list"
        ref="articleListRef"

    >
      <el-skeleton :rows="20" animated v-if="articlesLoading" />
      <div
          class="article-card"
          v-else
      >
        <div class="article-content" v-html="htmlContent"></div>
      </div>
    </div>
  </div>
  <div class="header" :style="{ backgroundImage: `url(${wallpaperUrl})` }" v-else>
    <h1 >请使用移动端访问获得更好体验</h1>
  </div>
  </div>

</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
}
.header {
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
  overflow: hidden; /* 确保圆角和背景图不超出边界 */
  border-radius: 25px;
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

.article-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.article-meta .views, .article-meta .author, .article-meta .date {
  display: flex;
  align-items: center;
  margin: 0 5px;  /* 给每个元素添加左右间距 */
}
.article-meta .author {
  text-align: center;
}

.article-meta .date {
  text-align: right;
}

.preview-container {
  margin-top: 20px;
  text-align: center;
}
</style>