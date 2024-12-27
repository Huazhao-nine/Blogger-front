import request from '../api/request'
import axios from "axios"; // 引入封装好的请求模块

/**
 * 获取每日壁纸
 * @returns {Promise<Object>} 返回壁纸数据对象
 */
export const getWallPaper = () => {
    return request.get('/getWallPaper')
}