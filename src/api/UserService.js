import request from "@/api/request.js";

export const sendValidateCode = (email) => {
    return request.get('/sendValidateCode', {
        params: {
            email: email,
        }
    })
}

export const login = (User) => {
    return request.post('/login', User);
};