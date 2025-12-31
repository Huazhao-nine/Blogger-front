import request from "@/api/request.js";

export const getAllCategories = () => {
    return request.get('/Category/getAll')
}

export const addCategory = (Category) => {
    return request.post('/Category/add', Category);
};

// export const getCategoryDetail = async (categoryId) => {
    // const response = await getArticleByID(articleId);
    // const article = response.data.data;
    // if (firstClick.value){
    //   ElNotification({
    //     title: '正在跳转',
    //     message: '正在前往文章的路上',
    //     type: 'warning',
    //   });
    //   firstClick.value = false
    // }
    // await router.push(`/Category/${categoryId}`);
// };