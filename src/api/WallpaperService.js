import request from "@/api/request.js";
import {ElNotification} from "element-plus";

/**
 * 获取每日壁纸
 * @returns {Promise<Object>} 返回壁纸数据对象
 */
export const getWallPaper = () => {
    return request.get('/getWallPaper')
}

export const fetchWallpaper = async (wallpaperUrl) => {
    try {
        let imageUrl = await getWallPaper();
        const wallpaperData = imageUrl.data.msg;
        if (imageUrl.data.code === 200) {
            const parsedData = JSON.parse(wallpaperData);
            const baseUrl = 'https://www.bing.com';
            imageUrl = baseUrl + parsedData.images[0].url;
            wallpaperUrl.value = imageUrl;
        } else {
            // 弹出错误通知
            ElNotification({
                title: '错误',
                message: '壁纸初始化失败',
                type: 'error',
            });
        }
    } catch (error) {
        // 捕获异常并弹出错误提示
        console.error(error);
        ElNotification({
            title: '错误',
            message: '服务器已离线，请稍后再试。',
            type: 'error',
        });
    }
};
