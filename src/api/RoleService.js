import request from "@/api/request.js";
import {useAuthStore} from "@/stores/auth.js";
import {ElNotification} from "element-plus";
import router from "@/router/index.js";

export const canEdit = (id) => {
    return request.get(`/canEdit/${id}`);
};


const auth = useAuthStore()
export const goToEdit = async () => {
    if (auth.isAuthenticated){
        let res = await canEdit(auth.user.id);
        if (res.data.code === 200){
             await router.push('/Edit')
        }
        else {
            ElNotification({
                title: '错误',
                message: res.data.msg,
                type: 'error',
            });
        }
    }else {
        ElNotification({
            title: '错误',
            message: '请登录后重试',
            type: 'error',
        });
    }

}

export const canView = (id) => {
    return request.get(`/canView/${id}`, )
}
