import { User } from './user';
import { Conversation } from './conversation';

/** 通知类型枚举 */
export enum NotificationType {
    FRIEND_REQUEST = 'friend_request', // 好友请求
    FRIEND_ACCEPTED = 'friend_accepted', // 好友请求通过
    GROUP_INVITE = 'group_invite', // 群邀请
    NEW_MESSAGE = 'new_message', // 新消息
    SYSTEM = 'system', // 系统通知
}

/** 通知实体 */
export interface Notification {
    notification_id: number;
    user_id: number; // 接收用户ID
    type: NotificationType;
    title: string;
    content: string;
    related_id?: number; // 关联ID（如好友请求ID/群ID）
    is_read: boolean;
    created_at: string;
    sender?: User; // 发送者信息
    conversation?: Conversation; // 关联对话
}

/** 通知列表响应 */
export interface NotificationsResponse {
    notifications: Notification[];
    unread_count: number;
}

/** 标记通知已读请求 */
export interface MarkNotificationReadRequest {
    notification_id?: number; // 单个通知ID
    all?: boolean; // 是否标记全部已读
}