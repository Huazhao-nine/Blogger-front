import { createRouter, createWebHistory } from 'vue-router';


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
            path: '/Articles',
            component: () => import('@/pages/Articles.vue')
        },
    ]
})

export default router
