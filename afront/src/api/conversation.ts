import api from './index';
import {
    Conversation,
    CreateConversationRequest,
    ConversationsResponse,
    ConversationDetailResponse
} from '../types/conversation';

/**
 * 获取对话列表
 */
export const getConversations = async (): Promise<ConversationsResponse> => {
    const response = await api.get('/conversations');
    return response.data;
};

/**
 * 创建对话
 * @param params - 创建参数
 */
export const createConversation = async (params: CreateConversationRequest): Promise<Conversation> => {
    const response = await api.post('/conversations', params);
    return response.data;
};

/**
 * 获取对话详情
 * @param conversationId - 对话ID
 */
export const getConversationDetail = async (conversationId: number): Promise<ConversationDetailResponse> => {
    const response = await api.get(`/conversations/${conversationId}`);
    return response.data;
};

/**
 * 更新对话名称
 * @param conversationId - 对话ID
 * @param name - 新名称
 */
export const updateConversationName = async (
    conversationId: number,
    name: string
): Promise<Conversation> => {
    const response = await api.patch(`/conversations/${conversationId}`, { name });
    return response.data;
};

/**
 * 删除对话
 * @param conversationId - 对话ID
 */
export const deleteConversation = async (conversationId: number): Promise<{ message: string }> => {
    const response = await api.delete(`/conversations/${conversationId}`);
    return response.data;
};

/**
 * 获取未读消息数
 */
export const getUnreadCount = async (): Promise<{ count: number }> => {
    const response = await api.get('/conversations/unread-count');
    return response.data;
};