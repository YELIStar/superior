import { User } from './user';

/** 群成员角色枚举 */
export enum GroupRole {
    OWNER = 'owner', // 群主
    ADMIN = 'admin', // 管理员
    MEMBER = 'member', // 普通成员
}

/** 群组实体 */
export interface Group {
    group_id: number;
    name: string;
    avatar?: string;
    description?: string;
    creator_id: number;
    creator?: User;
    member_count: number;
    created_at: string;
    updated_at: string;
}

/** 群成员实体 */
export interface GroupMember {
    id: number;
    group_id: number;
    user_id: number;
    user?: User;
    role: GroupRole;
    joined_at: string;
}

/** 创建群组请求 */
export interface CreateGroupRequest {
    name: string;
    avatar?: string;
    description?: string;
    member_ids: number[]; // 初始成员ID列表
}

/** 邀请入群请求 */
export interface InviteToGroupRequest {
    group_id: number;
    user_ids: number[];
}

/** 群成员列表响应 */
export interface GroupMembersResponse {
    members: GroupMember[];
    total: number;
}

/** 群组列表响应 */
export interface GroupsResponse {
    groups: Group[];
    total: number;
}