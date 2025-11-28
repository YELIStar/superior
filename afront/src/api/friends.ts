import api from './index';
import {
    Friend,
    FriendGroup,
    AddFriendRequest,
    HandleFriendRequest,
    FriendsResponse,
    FriendRequest
} from '../types/friends';

/**
 * 获取好友列表
 */
export const getFriends = async (): Promise<FriendsResponse> => {
    const response = await api.get('/friends');
    return response.data;
};

/**
 * 添加好友
 * @param params - 添加好友参数
 */
export const addFriend = async (params: AddFriendRequest): Promise<{ message: string }> => {
    const response = await api.post('/friends', params);
    return response.data;
};

/**
 * 处理好友请求
 * @param params - 处理参数
 */
export const handleFriendRequest = async (params: HandleFriendRequest): Promise<{ message: string }> => {
    const response = await api.post('/friends/handle-request', {
        request_id: params.request_id,
        action: params.action
    });
    return response.data;
};

/**
 * 获取好友请求列表
 */
export const getFriendRequests = async (): Promise<{ requests: FriendRequest[] }> => {
    const response = await api.get('/friends/requests');
    return response.data;
};

/**
 * 删除好友
 * @param friendId - 好友ID
 */
export const deleteFriend = async (friendId: number): Promise<{ message: string }> => {
    const response = await api.delete(`/friends/${friendId}`);
    return response.data;
};

/**
 * 创建好友分组
 * @param groupName - 分组名称
 */
export const createFriendGroup = async (groupName: string): Promise<FriendGroup> => {
    const response = await api.post('/friends/groups', { group_name: groupName });
    return response.data;
};

/**
 * 更新好友分组
 * @param groupId - 分组ID
 * @param groupName - 新分组名称
 */
export const updateFriendGroup = async (
    groupId: number,
    groupName: string
): Promise<FriendGroup> => {
    const response = await api.patch(`/friends/groups/${groupId}`, { group_name: groupName });
    return response.data;
};

/**
 * 移动好友到分组
 * @param friendId - 好友ID
 * @param groupId - 目标分组ID
 */
export const moveFriendToGroup = async (
    friendId: number,
    groupId: number
): Promise<{ message: string }> => {
    const response = await api.post(`/friends/${friendId}/group`, { group_id: groupId });
    return response.data;
};