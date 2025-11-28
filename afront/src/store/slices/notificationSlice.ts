import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Notification, MarkNotificationReadRequest } from '../../types/notification';
import { getNotifications, markNotificationRead, deleteNotification, getUnreadNotificationCount } from '../../api/notification';

// 异步Thunk：获取通知列表
export const fetchNotifications = createAsyncThunk(
    'notification/fetchNotifications',
    async (_, { rejectWithValue }) => {
        try {
            const response = await getNotifications();
            return {
                notifications: response.notifications,
                unreadCount: response.unread_count,
            };
        } catch (error: any) {
            return rejectWithValue(error.message || '获取通知失败');
        }
    }
);

// 异步Thunk：标记通知已读
export const markNotificationAsRead = createAsyncThunk(
    'notification/markNotificationRead',
    async (params: MarkNotificationReadRequest, { rejectWithValue }) => {
        try {
            await markNotificationRead(params);
            return params;
        } catch (error: any) {
            return rejectWithValue(error.message || '标记通知已读失败');
        }
    }
);

// 异步Thunk：删除通知
export const deleteNotificationById = createAsyncThunk(
    'notification/deleteNotification',
    async (notificationId: number, { rejectWithValue }) => {
        try {
            await deleteNotification(notificationId);
            return notificationId;
        } catch (error: any) {
            return rejectWithValue(error.message || '删除通知失败');
        }
    }
);

// 异步Thunk：获取未读通知数
export const fetchUnreadNotificationCount = createAsyncThunk(
    'notification/fetchUnreadCount',
    async (_, { rejectWithValue }) => {
        try {
            const response = await getUnreadNotificationCount();
            return response.count;
        } catch (error: any) {
            return rejectWithValue(error.message || '获取未读通知数失败');
        }
    }
);

// 初始状态
interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    error: string | null;
}

const initialState: NotificationState = {
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,
};

// 创建Slice
const notificationSlice = createSlice({
    name: 'notification',
    initialState,
    reducers: {
        addNewNotification: (state, action) => {
            state.notifications.unshift(action.payload);
            state.unreadCount += 1;
        },
        clearNotificationError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // 获取通知列表
        builder
            .addCase(fetchNotifications.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.isLoading = false;
                state.notifications = action.payload.notifications;
                state.unreadCount = action.payload.unreadCount;
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // 标记通知已读
        builder
            .addCase(markNotificationAsRead.fulfilled, (state, action) => {
                const { notification_id, all } = action.payload;
                if (all) {
                    state.notifications.forEach(notification => {
                        notification.is_read = true;
                    });
                    state.unreadCount = 0;
                } else if (notification_id) {
                    const index = state.notifications.findIndex(
                        n => n.notification_id === notification_id
                    );
                    if (index !== -1) {
                        state.notifications[index].is_read = true;
                        state.unreadCount -= 1;
                    }
                }
            });

        // 删除通知
        builder
            .addCase(deleteNotificationById.fulfilled, (state, action) => {
                state.notifications = state.notifications.filter(
                    n => n.notification_id !== action.payload
                );
            });

        // 获取未读通知数
        builder
            .addCase(fetchUnreadNotificationCount.fulfilled, (state, action) => {
                state.unreadCount = action.payload;
            });
    },
});

export const { addNewNotification, clearNotificationError } = notificationSlice.actions;
export default notificationSlice.reducer;