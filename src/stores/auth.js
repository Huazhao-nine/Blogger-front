// stores/auth.js
import {defineStore} from 'pinia';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: localStorage.getItem('token') || '', // 从 localStorage 获取 token
        user: JSON.parse(localStorage.getItem('user')) || {}, // 从 localStorage 获取 user
    }),
    actions: {
        setToken(token) {
            this.token = token;
            localStorage.setItem('token', token); // 存储到 localStorage
        },
        setUser(user) {
            this.user = user;
            localStorage.setItem('user', JSON.stringify(user)); // 存储到 localStorage
        },
        logout() {
            this.token = '';
            this.user = {};
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    },
    getters: {
        isAuthenticated: (state) => !!state.token // 判断是否已经登录
    }
});
