import { User } from './user';

/** 好友状态枚举 */
export enum FriendStatus {
    PENDING = 'pending', // 待确认
    ACCEPTED = 'accepted', // 已通过
    BLOCKED = 'blocked', // 已拉黑
}

/** 好友关系实体 */
export interface Friend {
    friend_id: number;
    user_id: number;
    friend_info: User; // 好友的用户信息
    status: FriendStatus;
    group_id: number; // 好友分组ID
    group_name?: string; // 分组名称
    remark?: string; // 好友备注
    created_at: string;
}

/** 好友分组实体 */
export interface FriendGroup {
    group_id: number;
    user_id: number;
    group_name: string;
    created_at: string;
}

/** 添加好友请求 */
export interface AddFriendRequest {
    friend_id: number;
    group_id?: number;
    remark?: string;
    message?: string; // 好友请求附言
}

/** 处理好友请求 */
export interface HandleFriendRequest {
    request_id: number;
    action: 'accept' | 'reject';
}

/** 好友列表响应 */
export interface FriendsResponse {
    friends: Friend[];
    groups: FriendGroup[];
}

/** 好友申请列表项 */
export interface FriendRequest {
    request_id: number;
    from_user: User;
    message?: string;
    created_at: string;
}