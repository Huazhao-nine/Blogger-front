import {createRouter, createWebHistory} from 'vue-router';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
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
            path: '/article/articleID=:id', // 路由参数 :id 用于动态获取文章ID
            component: () => import('@/pages/ArticleDetail.vue'),
            props: true  // 启用路由传参到组件
        },
        {
            path: '/article/categoryID=:id', // 路由参数 :id 用于动态获取文章ID
            component: () => import('@/pages/Article.vue'),
            props: true  // 启用路由传参到组件
        },
        {
            path: '/Edit',
            component: () => import('@/pages/Edit.vue')
        },
        {
            path: '/Edit/articleID=:id',
            component: () => import('@/pages/Edit.vue')
        },
    ]
})

export default router;
