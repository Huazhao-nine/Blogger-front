import request from "@/api/request.js";

export const getAllCategories = () => {
    return request.get('/Category/getAll')
}

export const addCategory = (Category) => {
    return request.post('/Category/add', Category);
};
