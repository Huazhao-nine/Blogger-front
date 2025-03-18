import request from "@/api/request.js";
import axios from "axios";

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

export const isAuthor = (articleData, id) => {
    return request.put(`/isAuthor/${id}`, articleData);
}

export const QQLogin = (QQLoginPak) => {
    return request.post('/qq/login', QQLoginPak);
}

export const getUserByopenid = (openid) => {
    return request.get(`/getUserByopenid/${openid}`)
}