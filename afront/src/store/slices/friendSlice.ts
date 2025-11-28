import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Friend, FriendGroup, AddFriendRequest, HandleFriendRequest } from '../../types/friends';
import {
    getFriends,
    addFriend,
    getFriendRequests,
    handleFriendRequest,
    deleteFriend,
    createFriendGroup,
    moveFriendToGroup
} from '../../api/friends';

// 异步Thunk：获取好友列表
export const fetchFriends = createAsyncThunk(
    'friend/fetchFriends',
    async (_, { rejectWithValue }) => {
        try {
            const response = await getFriends();
            return {
                friends: response.friends,
                groups: response.groups,
            };
        } catch (error: any) {
            return rejectWithValue(error.message || '获取好友列表失败');
        }
    }
);

// 异步Thunk：添加好友
export const addNewFriend = createAsyncThunk(
    'friend/addFriend',
    async (params: AddFriendRequest, { rejectWithValue }) => {
        try {
            const response = await addFriend(params);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || '添加好友失败');
        }
    }
);

// 异步Thunk：获取好友请求
export const fetchFriendRequests = createAsyncThunk(
    'friend/fetchFriendRequests',
    async (_, { rejectWithValue }) => {
        try {
            const response = await getFriendRequests();
            return response.requests;
        } catch (error: any) {
            return rejectWithValue(error.message || '获取好友请求失败');
        }
    }
);

// 异步Thunk：处理好友请求
export const handleNewFriendRequest = createAsyncThunk(
    'friend/handleFriendRequest',
    async (params: HandleFriendRequest, { rejectWithValue }) => {
        try {
            const response = await handleFriendRequest(params);
            return {
                ...params,
                message: response.message,
            };
        } catch (error: any) {
            return rejectWithValue(error.message || '处理好友请求失败');
        }
    }
);

// 异步Thunk：删除好友
export const deleteFriendById = createAsyncThunk(
    'friend/deleteFriend',
    async (friendId: number, { rejectWithValue }) => {
        try {
            await deleteFriend(friendId);
            return friendId;
        } catch (error: any) {
            return rejectWithValue(error.message || '删除好友失败');
        }
    }
);

// 异步Thunk：创建好友分组
export const createNewFriendGroup = createAsyncThunk(
    'friend/createFriendGroup',
    async (groupName: string, { rejectWithValue }) => {
        try {
            const response = await createFriendGroup(groupName);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || '创建分组失败');
        }
    }
);

// 初始状态
interface FriendState {
    friends: Friend[];
    groups: FriendGroup[];
    requests: any[];
    isLoading: boolean;
    error: string | null;
}

const initialState: FriendState = {
    friends: [],
    groups: [],
    requests: [],
    isLoading: false,
    error: null,
};

// 创建Slice
const friendSlice = createSlice({
    name: 'friend',
    initialState,
    reducers: {
        clearFriendError: (state) => {
            state.error = null;
        },
        updateFriendRemark: (state, action) => {
            const { friendId, remark } = action.payload;
            const index = state.friends.findIndex(f => f.friend_id === friendId);
            if (index !== -1) {
                state.friends[index].remark = remark;
            }
        },
    },
    extraReducers: (builder) => {
        // 获取好友列表
        builder
            .addCase(fetchFriends.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchFriends.fulfilled, (state, action) => {
                state.isLoading = false;
                state.friends = action.payload.friends;
                state.groups = action.payload.groups;
            })
            .addCase(fetchFriends.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // 获取好友请求
        builder
            .addCase(fetchFriendRequests.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchFriendRequests.fulfilled, (state, action) => {
                state.isLoading = false;
                state.requests = action.payload;
            })
            .addCase(fetchFriendRequests.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // 删除好友
        builder
            .addCase(deleteFriendById.fulfilled, (state, action) => {
                state.friends = state.friends.filter(f => f.friend_id !== action.payload);
            });

        // 创建好友分组
        builder
            .addCase(createNewFriendGroup.fulfilled, (state, action) => {
                state.groups.push(action.payload);
            });
    },
});

export const { clearFriendError, updateFriendRemark } = friendSlice.actions;
export default friendSlice.reducer;