import {ref} from 'vue';
// 定义全局变量
export const HomePage = ref(1); // 当前页
export const HomeArticles = ref(10); // 每页文章数
export const HomeArticlesForPC = ref(15); // 每页文章数
export const WEB_URL = "https://flowerinfire.com/#"
export const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric' });
};