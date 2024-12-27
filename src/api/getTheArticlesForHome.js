import request from "@/api/request.js";

export const getTheArticlesForHome = (page, pageSize) => {
    return request.get('/getTheArticlesForHome', {
        params: {
            page: page,
            pageSize: pageSize,
        }
    })
}