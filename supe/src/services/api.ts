// API 服务配置
const API_BASE_URL = 'http://localhost:3000/api';

// API 响应类型
interface ApiResponse<T = any> {
    data: T;
    message?: string;
    status: number;
}

// 用户数据类型
interface User {
    id: number;
    name: string;
    email: string;
    createdAt: string;
    updatedAt: string;
}



// 通用的 fetch 包装器
const apiCall = async <T = any>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> => {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultOptions: RequestInit = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    };

    try {
        const response = await fetch(url, { ...defaultOptions, ...options });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
};

// API 服务方法
export const apiService = {
    // 获取用户信息
    getUser: (id: number): Promise<ApiResponse<User>> =>
        apiCall<User>(`/users/${id}`),

    // 获取所有用户
    getUsers: (): Promise<ApiResponse<User[]>> =>
        apiCall<User[]>('/users'),

    // 创建用户
    createUser: (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<User>> =>
        apiCall<User>('/users', {
            method: 'POST',
            body: JSON.stringify(userData),
        }),

    // 更新用户
    updateUser: (id: number, userData: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ApiResponse<User>> =>
        apiCall<User>(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(userData),
        }),

    // 删除用户
    deleteUser: (id: number): Promise<ApiResponse<void>> =>
        apiCall<void>(`/users/${id}`, {
            method: 'DELETE',
        }),
};

export default apiService;
export type { User, ApiResponse };