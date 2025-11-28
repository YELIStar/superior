import localforage from 'localforage';

// 配置localforage
localforage.config({
    driver: localforage.INDEXEDDB, // 优先使用IndexedDB
    name: 'ChatApp',
    version: 1.0,
    storeName: 'chat_storage',
});

/**
 * 通用存储工具类
 */
export const storage = {
    /**
     * 设置存储项
     * @param key - 键名
     * @param value - 值（支持任意可序列化类型）
     */
    set: async <T>(key: string, value: T): Promise<void> => {
        await localforage.setItem(key, value);
    },

    /**
     * 获取存储项
     * @param key - 键名
     */
    get: async <T>(key: string): Promise<T | null> => {
        return await localforage.getItem(key);
    },

    /**
     * 移除存储项
     * @param key - 键名
     */
    remove: async (key: string): Promise<void> => {
        await localforage.removeItem(key);
    },

    /**
     * 清空所有存储
     */
    clear: async (): Promise<void> => {
        await localforage.clear();
    },

    /**
     * 获取所有键名
     */
    keys: async (): Promise<string[]> => {
        return await localforage.keys();
    },

    /**
     * 获取存储长度
     */
    length: async (): Promise<number> => {
        return await localforage.length();
    },

    /**
     * 获取多个存储项
     * @param keys - 键名数组
     */
    getMultiple: async <T>(keys: string[]): Promise<(T[] | null)> => {
        return await localforage.getItem<T[]>(keys.join(','));
    },
};

/**
 * 会话存储（页面刷新后失效）
 */
export const sessionStorage = {
    set: <T>(key: string, value: T): void => {
        window.sessionStorage.setItem(key, JSON.stringify(value));
    },

    get: <T>(key: string): T | null => {
        const value = window.sessionStorage.getItem(key);
        return value ? JSON.parse(value) : null;
    },

    remove: (key: string): void => {
        window.sessionStorage.removeItem(key);
    },

    clear: (): void => {
        window.sessionStorage.clear();
    },
};

/**
 * 本地缓存管理（带过期时间）
 */
export const cache = {
    /**
     * 设置缓存项
     * @param key - 键名
     * @param value - 值
     * @param expireSeconds - 过期时间（秒），默认永久
     */
    set: async <T>(key: string, value: T, expireSeconds?: number): Promise<void> => {
        const data = {
            value,
            expire: expireSeconds ? Date.now() + expireSeconds * 1000 : null,
        };
        await storage.set(key, data);
    },

    /**
     * 获取缓存项（自动检查过期）
     * @param key - 键名
     */
    get: async <T>(key: string): Promise<T | null> => {
        const data = await storage.get<{ value: T; expire: number | null }>(key);

        if (!data) return null;

        // 检查是否过期
        if (data.expire && Date.now() > data.expire) {
            await storage.remove(key);
            return null;
        }

        return data.value;
    },

    /**
     * 移除缓存项
     * @param key - 键名
     */
    remove: async (key: string): Promise<void> => {
        await storage.remove(key);
    },

    /**
     * 清空所有缓存
     */
    clear: async (): Promise<void> => {
        const keys = await storage.keys();
        // 只清除缓存项（以cache_开头）
        const cacheKeys = keys.filter(key => key.startsWith('cache_'));
        for (const key of cacheKeys) {
            await storage.remove(key);
        }
    },
};