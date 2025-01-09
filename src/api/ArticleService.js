import request from "@/api/request.js";

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

export const getArticleByID = (id) => {
    return request.get(`/getArticleByID/${id}`)
}

export const getArticlesByCategory = (id) => {
    return request.get(`/getArticlesByCategory/${id}`)
}
