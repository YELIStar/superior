import api from './index';
import {
    Notification,
    NotificationsResponse,
    MarkNotificationReadRequest
} from '../types/notification';

/**
 * 获取通知列表
 */
export const getNotifications = async (): Promise<NotificationsResponse> => {
    const response = await api.get('/notifications');
    return response.data;
};

/**
 * 标记通知已读
 * @param params - 标记参数
 */
export const markNotificationRead = async (
    params: MarkNotificationReadRequest
): Promise<{ message: string }> => {
    const response = await api.post('/notifications/read', params);
    return response.data;
};

/**
 * 删除通知
 * @param notificationId - 通知ID
 */
export const deleteNotification = async (notificationId: number): Promise<{ message: string }> => {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
};

/**
 * 获取未读通知数
 */
export const getUnreadNotificationCount = async (): Promise<{ count: number }> => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
};