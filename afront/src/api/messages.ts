import api from './index';
import {
    Message,
    SendMessageRequest,
    GetMessagesRequest,
    MessagesResponse
} from '../types/message';

/**
 * 获取对话消息列表
 * @param conversationId - 对话ID
 * @param params - 分页参数
 */
export const getMessages = async (
    conversationId: number,
    params?: { offset?: number; limit?: number }
): Promise<MessagesResponse> => {
    const response = await api.get(`/messages/conversation/${conversationId}`, { params });
    return response.data;
};

/**
 * 发送消息
 * @param params - 消息参数
 */
export const sendMessage = async (params: SendMessageRequest): Promise<Message> => {
    const response = await api.post('/messages', params);
    return response.data;
};

/**
 * 撤回消息
 * @param messageId - 消息ID
 */
export const recallMessage = async (messageId: number): Promise<{ message: string }> => {
    const response = await api.patch(`/messages/${messageId}/recall`);
    return response.data;
};

/**
 * 删除消息
 * @param messageId - 消息ID
 */
export const deleteMessage = async (messageId: number): Promise<{ message: string }> => {
    const response = await api.delete(`/messages/${messageId}`);
    return response.data;
};

/**
 * 标记消息已读
 * @param conversationId - 对话ID
 */
export const markMessagesAsRead = async (conversationId: number): Promise<{ message: string }> => {
    const response = await api.post(`/messages/conversation/${conversationId}/read`);
    return response.data;
};