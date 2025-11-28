import api from './index';
import {
    LoginRequest,
    RegisterRequest,
    User,
    LoginResponse,
    UpdateProfileRequest,
    ProfileResponse
} from '../types/user';

/**
 * 用户登录
 * @param params - 登录参数
 */
export const login = async (params: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post('/user/login', params);
    return response.data;
};

/**
 * 用户注册
 * @param params - 注册参数
 */
export const register = async (params: RegisterRequest): Promise<{ user_id: number }> => {
    const response = await api.post('/user/register', params);
    return response.data;
};

/**
 * 获取当前用户信息
 */
export const getProfile = async (): Promise<ProfileResponse> => {
    const response = await api.get('/user/profile');
    return response.data;
};

/**
 * 更新用户资料
 * @param params - 更新参数
 */
export const updateProfile = async (params: UpdateProfileRequest): Promise<User> => {
    const response = await api.patch('/user/profile', params);
    return response.data;
};

/**
 * 刷新令牌
 * @param refreshToken - 刷新令牌
 */
export const refreshTokenAPI = async (refreshToken: string): Promise<{ access_token: string }> => {
    const response = await api.post('/user/refresh-token', { refresh_token: refreshToken });
    return response.data;
};

/**
 * 修改密码
 * @param params - 密码修改参数
 */
export const changePassword = async (params: {
    old_password: string;
    new_password: string
}): Promise<{ message: string }> => {
    const response = await api.post('/user/change-password', params);
    return response.data;
};

/**
 * 获取用户详情
 * @param userId - 用户ID
 */
export const getUserDetail = async (userId: number): Promise<User> => {
    const response = await api.get(`/user/${userId}`);
    return response.data;
};