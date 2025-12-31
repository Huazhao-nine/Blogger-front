import {createRouter, createWebHashHistory} from 'vue-router';

const router = createRouter({
    history: createWebHashHistory(import.meta.env.BASE_URL),
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            // 如果是浏览器的“后退”按钮，则回到之前的滚动位置
            return savedPosition
        } else {
            // 否则跳转新页面时，强制滚动到顶部
            return { top: 0, behavior: 'smooth' } // behavior: 'smooth' 提供平滑滚动效果
        }
    },
    routes: [
        {
            path: '/:pathMatch(.*)*',
            component: () => import('@/pages/NotFound.vue')
        },
        {
            path: '/',
            component: () => import('@/pages/Home.vue')
        },
        {
            path: '/About',
            component: () => import('@/pages/About.vue')
        },
        {
            path: '/Category',
            component: () => import('@/pages/Category.vue')
        },
        {
            path: '/Article/:id/:slug', // 路由参数 :id 用于动态获取文章ID
            component: () => import('@/pages/ArticleDetail.vue'),
            props: true  // 启用路由传参到组件
        },
        {
            path: '/Category/:id', // 路由参数 :id 用于动态获取文章ID
            component: () => import('@/pages/Article.vue'),
            props: true  // 启用路由传参到组件
        },
        {
            path: '/Edit',
            component: () => import('@/pages/Edit.vue')
        },
        {
            path: '/Edit/:id',
            component: () => import('@/pages/Edit.vue')
        },
        {
            path: '/Login',
            component: () => import('@/pages/Login.vue')
        },
        {
            path: '/Share',
            component: () => import('@/components/Bookmark.vue')
        },
        {
            path: '/Card',
            component: () => import('@/pages/Card.vue')
        },
        {
            name: 'NotFound',
            component: () => import('@/pages/Home.vue')

        },
        {
            path: '/Sbox',
            component: () => import('@/pages/Sbox.vue')

        },
        {
            path: '/geneticSbox',
            component: () => import('@/pages/geneticSbox.vue')

        },
        {
            path: '/start',
            component: () => import('@/pages/start.vue')

        },
        {
            path: '/face',
            component: () => import('@/pages/Face.vue')

        },
        {
            path: '/program',
            component: () => import('@/pages/Program.vue')

        }
    ],

})



export default router;
