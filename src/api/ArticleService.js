import request from "@/api/request.js";
import router from "@/router/index.js";
import {ElNotification} from "element-plus";
import {useAuthStore} from "@/stores/auth.js";

const auth = useAuthStore()
export const getTheArticlesForHome = (page, pageSize) => {
    return request.get('/getTheArticlesForHome', {
        params: {
            page: page,
            pageSize: pageSize,
        }
    })
}
export const addArticle = (articleData) => {
    return request.post('/addArticle', articleData);
};

export const editArticle = (articleData, password) => {
    return request.put(`/editArticle/${password}`, articleData);
}

export const getTheArticles = () => {
    return request.get('/getTheArticles')
}

export const getArticleByID = async (id, token) => {
    return request.get(`/getArticleByID/${id}`, {
        params: {
            token: token,
        }
    })
}

export const getSlugById = (id) => {
    return request.get(`/getSlugById/${id}`, )
}

export const getArticleByPwd = async (id, pwd) => {
    return await request.get(`/getArticleByPwd/${id}/${pwd}`,)
}

export const getArticlesByCategory = (id) => {
    return request.get(`/getArticlesByCategory/${id}`)
}

export const getArticlesDetail = async (articleId, token) => {
    const response = await getSlugById(articleId);
    if (response.data.code === 200) {
        // console.log("slug获取成功")
        const slug = response.data.msg;
        await router.push(`/Article/${articleId}/${slug}`);
    }else {
        ElNotification({
            title: '错误',
            message: response.data.msg,
            type: 'error',
        });
    }
};
