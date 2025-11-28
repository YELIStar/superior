/**
 * 深拷贝对象
 * @param obj - 源对象
 */
export const deepClone = <T>(obj: T): T => {
    if (obj === null || typeof obj !== 'object') return obj;

    if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
    if (obj instanceof Array) return obj.map(item => deepClone(item)) as unknown as T;
    if (obj instanceof Object) {
        const clonedObj = {} as T;
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }

    return obj;
};

/**
 * 防抖函数
 * @param func - 执行函数
 * @param delay - 延迟时间（毫秒）
 */
export const debounce = <T extends (...args: any[]) => any>(
    func: T,
    delay: number
): ((...args: Parameters<T>) => void) => {
    let timeoutId: ReturnType<typeof setTimeout>;

    return (...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
};

/**
 * 节流函数
 * @param func - 执行函数
 * @param interval - 间隔时间（毫秒）
 */
export const throttle = <T extends (...args: any[]) => any>(
    func: T,
    interval: number
): ((...args: Parameters<T>) => void) => {
    let lastTime = 0;

    return (...args: Parameters<T>) => {
        const now = Date.now();
        if (now - lastTime >= interval) {
            func(...args);
            lastTime = now;
        }
    };
};

/**
 * 生成UUID
 */
export const generateUUID = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

/**
 * 随机生成颜色（基于字符串）
 * @param str - 输入字符串
 * @param saturation - 饱和度
 * @param lightness - 亮度
 */
export const stringToColor = (str: string, saturation = 70, lightness = 70): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    return `hsl(${hash % 360}, ${saturation}%, ${lightness}%)`;
};

/**
 * 下载文件
 * @param url - 文件URL
 * @param filename - 文件名
 */
export const downloadFile = (url: string, filename: string): void => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

/**
 * 检查对象是否为空
 * @param obj - 目标对象
 */
export const isEmptyObject = (obj: object): boolean => {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
};

/**
 * 数组分组
 * @param array - 源数组
 * @param key - 分组键名
 */
export const groupBy = <T extends Record<string, any>>(
    array: T[],
    key: keyof T
): Record<string, T[]> => {
    return array.reduce((groups, item) => {
        const groupKey = String(item[key]);
        if (!groups[groupKey]) {
            groups[groupKey] = [];
        }
        groups[groupKey].push(item);
        return groups;
    }, {} as Record<string, T[]>);
};

/**
 * 数组去重
 * @param array - 源数组
 * @param key - 去重键名（可选）
 */
export const uniqueArray = <T>(array: T[], key?: keyof T): T[] => {
    if (!key) {
        return Array.from(new Set(array));
    }

    const seen = new Set();
    return array.filter(item => {
        const value = item[key];
        if (seen.has(value)) return false;
        seen.add(value);
        return true;
    });
};

/**
 * 安全解析JSON
 * @param jsonString - JSON字符串
 * @param defaultValue - 默认值
 */
export const safeJsonParse = <T>(jsonString: string, defaultValue: T): T => {
    try {
        return JSON.parse(jsonString) as T;
    } catch (error) {
        return defaultValue;
    }
};