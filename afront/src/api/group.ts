import api from './index';
import {
    Group,
    GroupMember,
    CreateGroupRequest,
    InviteToGroupRequest,
    GroupsResponse,
    GroupMembersResponse
} from '../types/group';

/**
 * 获取群组列表
 */
export const getGroups = async (): Promise<GroupsResponse> => {
    const response = await api.get('/groups');
    return response.data;
};

/**
 * 创建群组
 * @param params - 创建参数
 */
export const createGroup = async (params: CreateGroupRequest): Promise<Group> => {
    const response = await api.post('/groups', params);
    return response.data;
};

/**
 * 获取群组详情
 * @param groupId - 群组ID
 */
export const getGroupDetail = async (groupId: number): Promise<Group> => {
    const response = await api.get(`/groups/${groupId}`);
    return response.data;
};

/**
 * 获取群组成员
 * @param groupId - 群组ID
 */
export const getGroupMembers = async (groupId: number): Promise<GroupMembersResponse> => {
    const response = await api.get(`/groups/${groupId}/members`);
    return response.data;
};

/**
 * 邀请用户入群
 * @param params - 邀请参数
 */
export const inviteToGroup = async (params: InviteToGroupRequest): Promise<{ message: string }> => {
    const response = await api.post('/groups/invite', params);
    return response.data;
};

/**
 * 移出群成员
 * @param groupId - 群组ID
 * @param userId - 用户ID
 */
export const removeGroupMember = async (
    groupId: number,
    userId: number
): Promise<{ message: string }> => {
    const response = await api.delete(`/groups/${groupId}/members/${userId}`);
    return response.data;
};

/**
 * 更新群组信息
 * @param groupId - 群组ID
 * @param params - 更新参数
 */
export const updateGroup = async (
    groupId: number,
    params: { name?: string; description?: string; avatar?: string }
): Promise<Group> => {
    const response = await api.patch(`/groups/${groupId}`, params);
    return response.data;
};

/**
 * 退出群组
 * @param groupId - 群组ID
 */
export const leaveGroup = async (groupId: number): Promise<{ message: string }> => {
    const response = await api.post(`/groups/${groupId}/leave`, {});
    return response.data;
};

/**
 * 转让群主
 * @param groupId - 群组ID
 * @param userId - 新群主ID
 */
export const transferGroupOwner = async (
    groupId: number,
    userId: number
): Promise<{ message: string }> => {
    const response = await api.post(`/groups/${groupId}/transfer`, { user_id: userId });
    return response.data;
};