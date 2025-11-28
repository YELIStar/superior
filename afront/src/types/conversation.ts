import { User } from './user';
import { Message } from './message';

/** 对话类型枚举 */
export enum ConversationType {
    SINGLE = 'single', // 单聊
    GROUP = 'group', // 群聊
}

/** 对话实体 */
export interface Conversation {
    conversation_id: number;
    type: ConversationType;
    name?: string; // 群聊名称/单聊对方昵称
    avatar?: string; // 群聊头像/单聊对方头像
    members: User[]; // 对话成员
    last_message?: Message; // 最后一条消息
    unread_count: number; // 未读消息数
    created_at: string;
    updated_at: string;
}

/** 创建对话请求 */
export interface CreateConversationRequest {
    type: ConversationType;
    member_ids: number[]; // 成员ID列表
    name?: string; // 群聊名称（仅群聊）
    avatar?: string; // 群聊头像（仅群聊）
}

/** 对话列表响应 */
export interface ConversationsResponse {
    conversations: Conversation[];
    total: number;
}

/** 对话详情响应 */
export interface ConversationDetailResponse {
    conversation: Conversation;
    members: User[];
}