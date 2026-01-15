import {createRouter, createWebHashHistory} from 'vue-router';
import {useAuthStore} from '@/stores/auth'; // 引入 store
import {ElMessage} from 'element-plus';

const routes = [
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('@/pages/NotFound.vue'),
        meta: { title: '404 - 页面未找到' }
    },
    {
        path: '/',
        name: 'Home',
        component: () => import('@/pages/Home.vue'),
        meta: { title: '首页 - 花朝九日' }
    },
    {
        path: '/About',
        name: 'About',
        component: () => import('@/pages/About.vue'),
        meta: { title: '关于我' }
    },
    {
        path: '/Category',
        name: 'Category',
        component: () => import('@/pages/Category.vue'),
        meta: { title: '分类归档' }
    },
    {
        path: '/Article/:id/:slug',
        name: 'ArticleDetail',
        component: () => import('@/pages/ArticleDetail.vue'),
        props: true,
        meta: { title: '文章详情' } // 详情页标题通常在组件内动态修改，这里给个默认的
    },
    {
        path: '/Category/:id',
        name: 'CategoryDetail',
        component: () => import('@/pages/Article.vue'),
        props: true,
        meta: { title: '分类文章' }
    },
    {
        path: '/Edit',
        name: 'ArticleCreate',
        component: () => import('@/pages/Edit.vue'),
        meta: { title: '写文章', requiresAuth: true } // 🔒
    },
    {
        path: '/Edit/:id',
        name: 'ArticleEdit',
        component: () => import('@/pages/Edit.vue'),
        meta: { title: '编辑文章', requiresAuth: true } // 🔒
    },
    {
        path: '/Login',
        name: 'Login',
        component: () => import('@/pages/Login.vue'),
        meta: { title: '登录' }
    },
    {
        path: '/Share',
        name: 'Share',
        component: () => import('@/components/Bookmark.vue'),
        meta: { title: '书签分享' }
    },
    // ... 其他页面建议都加上 meta: { title: '...' }
    {
        path: '/Card',
        component: () => import('@/pages/Card.vue'),
        meta: { title: 'Card' }
    },
    {
        path: '/Sbox',
        component: () => import('@/pages/Sbox.vue'),
        meta: { title: 'Sbox' }
    },
    {
        path: '/geneticSbox',
        component: () => import('@/pages/geneticSbox.vue'),
        meta: { title: 'Genetic Sbox' }
    },
    {
        path: '/face',
        component: () => import('@/pages/Face.vue'),
        meta: { title: 'Face' }
    },
    {
        path: '/program',
        component: () => import('@/pages/Program.vue'),
        meta: { title: 'Program' }
    }
];

const router = createRouter({
    history: createWebHashHistory(import.meta.env.BASE_URL),
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition
        } else {
            return { top: 0, behavior: 'smooth' }
        }
    },
})
router.onError((error) => {
    const pattern = /Loading chunk (\d)+ failed/g;
    const isChunkLoadFailed = error.message.match(pattern) || error.message.includes("Failed to fetch dynamically imported module");

    if (isChunkLoadFailed) {
        // 🛑 这里加个简单的防死循环机制
        // 如果 10秒内已经刷新过了，就别再刷了，防止服务器真的挂了导致无限刷新
        const targetPath = router.currentRoute.value.fullPath;
        const lastReload = sessionStorage.getItem('last_reload_time');
        const now = Date.now();

        if (!lastReload || now - parseInt(lastReload) > 10000) {
            console.log('检测到版本更新，正在强制刷新...');
            sessionStorage.setItem('last_reload_time', now.toString());

            // ✅ 直接 reload，浏览器会自动解析 Hash 路由，不会丢 # 号
            window.location.reload();
        } else {
            console.error('资源加载失败，但刚刚已经刷新过了，可能是服务器真的缺文件。');
        }
    }
});
// 🚀 全局前置守卫
router.beforeEach((to, from, next) => {
    // 1. 设置网页标题
    if (to.meta.title) {
        document.title = `${to.meta.title} | 花朝九日`;
    } else {
        document.title = '花朝九日的博客';
    }

    // 2. 权限校验
    const authStore = useAuthStore();

    // 检查路由是否需要登录 (requiresAuth) 且 用户未登录 (!isAuthenticated)
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        ElMessage.warning('该页面需要登录才能访问');
        // 跳转去登录页，并带上 redirect 参数，以便登录后跳回来（可选优化）
        next({ name: 'Login' });
    } else {
        next(); // 放行
    }
})

export default router;