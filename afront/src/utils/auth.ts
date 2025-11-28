import localforage from 'localforage';
import { User } from '../types/user';
import { refreshTokenAPI } from '../api/user';

// 存储键名常量
const STORAGE_KEYS = {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    USER_INFO: 'user_info',
};

/**
 * 保存令牌
 * @param accessToken - 访问令牌
 * @param refreshToken - 刷新令牌
 */
export const saveTokens = async (accessToken: string, refreshToken: string) => {
    await localforage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    await localforage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
};

/**
 * 获取访问令牌
 */
export const getAccessToken = async (): Promise<string | null> => {
    return await localforage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
};

/**
 * 获取刷新令牌
 */
export const getRefreshToken = async (): Promise<string | null> => {
    return await localforage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
};

/**
 * 刷新访问令牌
 */
export const refreshAccessToken = async (): Promise<string | null> => {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) return null;

    try {
        const res = await refreshTokenAPI(refreshToken);
        const { access_token } = res;
        await saveTokens(access_token, refreshToken);
        return access_token;
    } catch (error) {
        await clearAuthData();
        return null;
    }
};

/**
 * 保存用户信息
 * @param user - 用户信息
 */
export const saveUserInfo = async (user: User) => {
    await localforage.setItem(STORAGE_KEYS.USER_INFO, user);
};

/**
 * 获取用户信息
 */
export const getUserInfo = async (): Promise<User | null> => {
    return await localforage.getItem(STORAGE_KEYS.USER_INFO);
};

/**
 * 清除认证数据（退出登录）
 */
export const clearAuthData = async () => {
    await localforage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    await localforage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    await localforage.removeItem(STORAGE_KEYS.USER_INFO);
};

/**
 * 检查令牌是否过期（简单校验）
 * @param token - JWT令牌
 */
export const isTokenExpired = (token: string): boolean => {
    try {
        if (!token) return true;
        const payload = JSON.parse(atob(token.split('.')[1]));
        const exp = payload.exp * 1000; // 转换为毫秒
        return Date.now() >= exp;
    } catch (error) {
        return true;
    }
};

/**
 * 获取令牌中的用户ID
 * @param token - JWT令牌
 */
export const getUserIdFromToken = (token: string): number | null => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.sub?.user_id || null;
    } catch (error) {
        return null;
    }
};