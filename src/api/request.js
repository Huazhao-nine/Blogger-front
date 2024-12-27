import axios from 'axios'
import router from '../router/index'
import { ElMessage } from 'element-plus'
const baseURL = '/api'
const instance = axios.create({
    baseURL,
    timeout: 100000
})

instance.interceptors.request.use(
    (config) => {
        // console.log("config",config);
        config.headers['Content-Type'] = 'application/json;charset=utf-8'
        // config.headers['token'] = user.token;  // 设置请求头
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

instance.interceptors.response.use(
    (response) => {
        // console.log("response",response);
            return response
    },
)

export default instance
export { baseURL }
