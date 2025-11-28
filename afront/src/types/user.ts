/** 用户信息 */
export interface User {
    user_id: number;
    username: string;
    phone?: string;
    email?: string;
    avatar?: string;
    status: UserStatus; // 在线状态
    last_login: string; // ISO时间字符串
    created_at: string;
}

/** 用户在线状态枚举 */
export enum UserStatus {
    OFFLINE = 0,
    ONLINE = 1,
    AWAY = 2,
    BUSY = 3,
}

/** 登录请求参数 */
export interface LoginRequest {
    username: string;
    password: string;
}

/** 注册请求参数 */
export interface RegisterRequest {
    username: string;
    password: string;
    phone?: string;
    email?: string;
}

/** 登录响应 */
export interface LoginResponse {
    access_token: string;
    refresh_token: string;
    user: User;
}

/** 更新用户资料请求 */
export interface UpdateProfileRequest {
    username?: string;
    avatar?: string;
    email?: string;
    phone?: string;
}

/** 用户资料响应 */
export interface ProfileResponse {
    user: User;
}