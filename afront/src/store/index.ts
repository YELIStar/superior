import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import userReducer from './slices/userSlice';
import chatReducer from './slices/chatSlice';
import messageReducer from './slices/messageSlice';
import friendReducer from './slices/friendSlice';
import groupReducer from './slices/groupSlice';
import notificationReducer from './slices/notificationSlice';

// 配置Redux Store
export const store = configureStore({
    reducer: {
        user: userReducer,
        chat: chatReducer,
        message: messageReducer,
        friend: friendReducer,
        group: groupReducer,
        notification: notificationReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // 忽略不可序列化的字段（如Date对象）
                ignoredActionPaths: ['payload.created_at', 'payload.send_time'],
                ignoredPaths: ['user.user.last_login', 'message.messages.send_time'],
            },
        }),
});

// 导出类型
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// 自定义Hook（带类型）
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;