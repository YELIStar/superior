const BASE_API_URL = "https://localhost:5001/";

/**
 * 封装 fetch 请求
 * @param endurl 请求地址
 * @param options 请求配置
 * @returns Promise<T>
 */

const TransferPrinciple = async <T>(
    endurl: string,
    options: RequestInit = {}
): Promise<T> => {
    const urlRequest = `${BASE_API_URL}${endurl}`;
    const defaultOptions: RequestInit = {
        headers: {
            "Content-Type": "application/json",
            ...options.headers
        }
    };
    try {
        const response = await fetch(urlRequest, { ...defaultOptions, ...options }); // 将 defaultOptions 作为基础请求配置，允许用户通过 options 参数进行自定义请求配置
        if (!response.ok) {
            throw new Error(`HTTP error is ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        throw error;
    }
}

export default TransferPrinciple;
export { BASE_API_URL };
