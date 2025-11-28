// export interface Message {
//     message_id: number;
//     conversation_id: number;
//     sender_id: number;
//     content: string;
//     send_time: string;
//     is_recalled: boolean;
//     recalled_time?: string;
//     sender?: {
//         username: string;
//         avatar?: string;
//     };
// }

// export interface SendMessageRequest {
//     conversation_id: number;
//     content: string;
// }
import { User } from './user';

/** 消息类型枚举 */
export enum MessageType {
    TEXT = 'text',
    IMAGE = 'image',
    FILE = 'file',
    SYSTEM = 'system',
}

/** 消息状态枚举 */
export enum MessageStatus {
    SENDING = 'sending',
    SENT = 'sent',
    DELIVERED = 'delivered',
    READ = 'read',
    RECALLED = 'recalled',
}

/** 消息实体 */
export interface Message {
    message_id: number;
    conversation_id: number;
    sender_id: number;
    sender?: User; // 发送者信息（嵌套）
    content: string; // 文本内容或文件URL
    type: MessageType; // 消息类型
    status: MessageStatus; // 消息状态
    send_time: string; // ISO时间字符串
    is_recalled: boolean; // 是否已撤回
    recalled_time?: string;
}

/** 发送消息请求 */
export interface SendMessageRequest {
    conversation_id: number;
    content: string;
    type?: MessageType;
}

/** 获取消息列表请求（分页） */
export interface GetMessagesRequest {
    conversation_id: number;
    offset?: number;
    limit?: number;
}

/** 撤回消息请求 */
export interface RecallMessageRequest {
    message_id: number;
}

/** 消息列表响应 */
export interface MessagesResponse {
    messages: Message[];
    total: number;
    has_more: boolean;
}