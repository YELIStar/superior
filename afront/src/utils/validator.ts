/**
 * 验证邮箱格式
 * @param email - 邮箱地址
 */
export const isEmailValid = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

/**
 * 验证手机号码格式
 * @param phone - 手机号码
 */
export const isPhoneValid = (phone: string): boolean => {
    const regex = /^1[3-9]\d{9}$/;
    return regex.test(phone);
};

/**
 * 验证密码强度（至少8位，包含字母和数字）
 * @param password - 密码
 */
export const isPasswordStrong = (password: string): boolean => {
    // 至少8位，包含字母和数字
    const regex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    return regex.test(password);
};

/**
 * 验证用户名（4-20位，字母、数字、下划线）
 * @param username - 用户名
 */
export const isUsernameValid = (username: string): boolean => {
    const regex = /^[a-zA-Z0-9_]{4,20}$/;
    return regex.test(username);
};

/**
 * 验证是否为URL
 * @param url - URL地址
 */
export const isUrlValid = (url: string): boolean => {
    try {
        new URL(url);
        return true;
    } catch (error) {
        return false;
    }
};

/**
 * 验证是否为图片文件
 * @param filename - 文件名
 */
export const isImageFile = (filename: string): boolean => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    return ext ? imageExts.includes(ext) : false;
};

/**
 * 验证文件大小
 * @param file - 文件对象
 * @param maxSize - 最大大小（MB）
 */
export const isFileSizeValid = (file: File, maxSize: number): boolean => {
    const fileSizeMB = file.size / (1024 * 1024);
    return fileSizeMB <= maxSize;
};

/**
 * 表单验证规则生成器
 */
export const formRules = {
    /** 必选字段规则 */
    required: (message = '此项为必填项') => ({
        required: true,
        message,
    }),

    /** 邮箱验证规则 */
    email: (message = '请输入有效的邮箱地址') => ({
        validator: (_, value: string) => {
            if (!value || isEmailValid(value)) {
                return Promise.resolve();
            }
            return Promise.reject(new Error(message));
        },
    }),

    /** 手机验证规则 */
    phone: (message = '请输入有效的手机号码') => ({
        validator: (_, value: string) => {
            if (!value || isPhoneValid(value)) {
                return Promise.resolve();
            }
            return Promise.reject(new Error(message));
        },
    }),

    /** 密码强度规则 */
    password: (message = '密码至少8位，包含字母和数字') => ({
        validator: (_, value: string) => {
            if (!value || isPasswordStrong(value)) {
                return Promise.resolve();
            }
            return Promise.reject(new Error(message));
        },
    }),

    /** 用户名规则 */
    username: (message = '用户名4-20位，可包含字母、数字、下划线') => ({
        validator: (_, value: string) => {
            if (!value || isUsernameValid(value)) {
                return Promise.resolve();
            }
            return Promise.reject(new Error(message));
        },
    }),

    /** 图片文件验证规则 */
    imageFile: (maxSize = 5, message?: string) => ({
        validator: (_, file: File) => {
            if (!file) return Promise.resolve();

            if (!isImageFile(file.name)) {
                return Promise.reject(new Error(message || '请上传图片文件（jpg/png/gif等）'));
            }

            if (!isFileSizeValid(file, maxSize)) {
                return Promise.reject(new Error(message || `文件大小不能超过${maxSize}MB`));
            }

            return Promise.resolve();
        },
    }),
};