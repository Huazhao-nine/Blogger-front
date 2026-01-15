import request from "@/api/request.js";
import router from "@/router/index.js";

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
        console.log(articleId)
        const response = await getSlugById(articleId);
        if (response.code === 200) {
            console.log(response)
            const slug = response.msg;
            await router.push({
                name: 'ArticleDetail',
                params: {
                    id: articleId,
                    slug: slug
                }
            });
        }else {
            ElNotification({
                title: '错误',
                message: response.msg,
                type: 'error',
            });
        }
    };
