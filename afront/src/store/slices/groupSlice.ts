import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Group, GroupMember, CreateGroupRequest, InviteToGroupRequest } from '../../types/group';
import {
    getGroups,
    createGroup,
    getGroupDetail,
    getGroupMembers,
    inviteToGroup,
    removeGroupMember,
    leaveGroup
} from '../../api/group';

// 异步Thunk：获取群组列表
export const fetchGroups = createAsyncThunk(
    'group/fetchGroups',
    async (_, { rejectWithValue }) => {
        try {
            const response = await getGroups();
            return response.groups;
        } catch (error: any) {
            return rejectWithValue(error.message || '获取群组列表失败');
        }
    }
);

// 异步Thunk：创建群组
export const createNewGroup = createAsyncThunk(
    'group/createGroup',
    async (params: CreateGroupRequest, { rejectWithValue }) => {
        try {
            const response = await createGroup(params);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || '创建群组失败');
        }
    }
);

// 异步Thunk：获取群组详情
export const fetchGroupDetail = createAsyncThunk(
    'group/fetchGroupDetail',
    async (groupId: number, { rejectWithValue }) => {
        try {
            const response = await getGroupDetail(groupId);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || '获取群组详情失败');
        }
    }
);

// 异步Thunk：获取群组成员
export const fetchGroupMembers = createAsyncThunk(
    'group/fetchGroupMembers',
    async (groupId: number, { rejectWithValue }) => {
        try {
            const response = await getGroupMembers(groupId);
            return {
                members: response.members,
                groupId,
            };
        } catch (error: any) {
            return rejectWithValue(error.message || '获取群组成员失败');
        }
    }
);

// 异步Thunk：邀请入群
export const inviteToGroupByIds = createAsyncThunk(
    'group/inviteToGroup',
    async (params: InviteToGroupRequest, { rejectWithValue }) => {
        try {
            await inviteToGroup(params);
            return params;
        } catch (error: any) {
            return rejectWithValue(error.message || '邀请入群失败');
        }
    }
);

// 异步Thunk：移出群成员
export const removeGroupMemberByIds = createAsyncThunk(
    'group/removeGroupMember',
    async ({ groupId, userId }: { groupId: number; userId: number }, { rejectWithValue }) => {
        try {
            await removeGroupMember(groupId, userId);
            return { groupId, userId };
        } catch (error: any) {
            return rejectWithValue(error.message || '移出群成员失败');
        }
    }
);

// 初始状态
interface GroupState {
    groups: Group[];
    currentGroup: Group | null;
    currentGroupMembers: GroupMember[];
    isLoading: boolean;
    error: string | null;
}

const initialState: GroupState = {
    groups: [],
    currentGroup: null,
    currentGroupMembers: [],
    isLoading: false,
    error: null,
};

// 创建Slice
const groupSlice = createSlice({
    name: 'group',
    initialState,
    reducers: {
        clearGroupError: (state) => {
            state.error = null;
        },
        setCurrentGroup: (state, action) => {
            state.currentGroup = action.payload;
        },
    },
    extraReducers: (builder) => {
        // 获取群组列表
        builder
            .addCase(fetchGroups.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchGroups.fulfilled, (state, action) => {
                state.isLoading = false;
                state.groups = action.payload;
            })
            .addCase(fetchGroups.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // 创建群组
        builder
            .addCase(createNewGroup.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(createNewGroup.fulfilled, (state, action) => {
                state.isLoading = false;
                state.groups.push(action.payload);
                state.currentGroup = action.payload;
            })
            .addCase(createNewGroup.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // 获取群组详情
        builder
            .addCase(fetchGroupDetail.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchGroupDetail.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentGroup = action.payload;
            })
            .addCase(fetchGroupDetail.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // 获取群组成员
        builder
            .addCase(fetchGroupMembers.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchGroupMembers.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentGroupMembers = action.payload.members;
            })
            .addCase(fetchGroupMembers.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // 移出群成员
        builder
            .addCase(removeGroupMemberByIds.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(removeGroupMemberByIds.fulfilled, (state, action) => {
                state.isLoading = false;
                // 从当前群成员列表中移除该成员
                state.currentGroupMembers = state.currentGroupMembers.filter(
                    member => member.user_id !== action.payload.userId
                );
            })
            .addCase(removeGroupMemberByIds.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearGroupError, setCurrentGroup } = groupSlice.actions;
export default groupSlice.reducer;