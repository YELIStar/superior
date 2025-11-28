import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

// 扩展dayjs插件
dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

/**
 * 格式化日期时间
 * @param date - 日期字符串/时间戳
 * @param format - 格式字符串，默认 'YYYY-MM-DD HH:mm:ss'
 */
export const formatDateTime = (date: string | number | Date, format = 'YYYY-MM-DD HH:mm:ss'): string => {
    if (!date) return '-';
    return dayjs(date).format(format);
};

/**
 * 格式化相对时间（如：刚刚、5分钟前）
 * @param date - 日期字符串/时间戳
 */
export const formatRelativeTime = (date: string | number | Date): string => {
    if (!date) return '-';
    return dayjs(date).fromNow();
};

/**
 * 格式化消息时间显示
 * @param date - 日期字符串/时间戳
 */
export const formatMessageTime = (date: string | number | Date): string => {
    if (!date) return '-';

    const now = dayjs();
    const target = dayjs(date);

    // 今天：显示HH:mm
    if (target.isSame(now, 'day')) {
        return target.format('HH:mm');
    }

    // 今年：显示MM-DD HH:mm
    if (target.isSame(now, 'year')) {
        return target.format('MM-DD HH:mm');
    }

    // 更早：显示YYYY-MM-DD
    return target.format('YYYY-MM-DD');
};

/**
 * 格式化文件大小
 * @param bytes - 文件大小（字节）
 * @param decimals - 保留小数位数
 */
export const formatFileSize = (bytes: number, decimals = 2): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * 截取文本（超出部分显示省略号）
 * @param text - 原始文本
 * @param maxLength - 最大长度
 */
export const truncateText = (text: string, maxLength: number): string => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

/**
 * 格式化手机号码（138****1234）
 * @param phone - 手机号码
 */
export const formatPhone = (phone: string): string => {
    if (!phone || phone.length !== 11) return phone;
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
};

/**
 * 格式化数字（添加千分位）
 * @param num - 数字
 */
export const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};