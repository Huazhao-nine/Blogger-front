// 获取 QQ 头像
import request from "@/api/request.js";

export const getQQAvatar = (QQ) => {
    return request.get(`/getUserImg/${QQ}`)
}
