import axios from 'axios';
import { getAccessToken, refreshAccessToken, clearAuthData } from '../utils/auth';

// 创建Axios实例
const api = axios.create({
    baseURL: 'http://localhost:5055/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 请求拦截器：添加认证令牌
api.interceptors.request.use(
    async (config) => {
        const token = await getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 响应拦截器：处理令牌过期和错误
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // 处理401未授权（令牌过期）
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // 尝试刷新令牌
                const newToken = await refreshAccessToken();
                if (newToken) {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // 刷新失败，登出并跳转登录页
                await clearAuthData();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        // 统一错误处理
        const errorMessage = error.response?.data?.message || error.message || '请求失败';
        return Promise.reject(new Error(errorMessage));
    }
);

export default api;