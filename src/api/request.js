import axios from 'axios'
import {useAuthStore} from '@/stores/auth'

const baseURL = '/api'
const instance = axios.create({
    baseURL,
    timeout: 10000
})

instance.interceptors.request.use(
    (config) => {
        config.headers['Content-Type'] = 'application/json;charset=utf-8'
        const authStore = useAuthStore()
        if (authStore.token) {
            config.headers['token'] = authStore.token
        }
        return config
    },
    (error) => Promise.reject(error)
)

instance.interceptors.response.use(
    (response) => {
        // 直接返回 response.data
        // 这样你在业务代码里拿到的就是后端返回的 { code: 200, data: ..., msg: ... }
        // 不需要再写 res.data.code 了，直接 res.code
        return response.data
    },
    (error) => {
        // 处理 HTTP 状态码错误 (如 404, 500)
        let message = error.message || '请求失败';
        if (error.response && error.response.data && error.response.data.msg) {
            message = error.response.data.msg;
        }
        ElMessage.error(message)
        return Promise.reject(error)
    }
)

export default instance
export { baseURL }