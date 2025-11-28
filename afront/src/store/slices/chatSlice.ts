import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Conversation, CreateConversationRequest } from '../../types/conversation';
import { getConversations, createConversation, getConversationDetail, getUnreadCount } from '../../api/conversation';

// 异步Thunk：获取对话列表
export const fetchConversations = createAsyncThunk(
    'chat/fetchConversations',
    async (_, { rejectWithValue }) => {
        try {
            const response = await getConversations();
            return response.conversations;
        } catch (error: any) {
            return rejectWithValue(error.message || '获取对话列表失败');
        }
    }
);

// 异步Thunk：创建对话
export const createNewConversation = createAsyncThunk(
    'chat/createConversation',
    async (params: CreateConversationRequest, { rejectWithValue }) => {
        try {
            const response = await createConversation(params);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || '创建对话失败');
        }
    }
);

// 异步Thunk：获取对话详情
export const fetchConversationDetail = createAsyncThunk(
    'chat/fetchConversationDetail',
    async (conversationId: number, { rejectWithValue }) => {
        try {
            const response = await getConversationDetail(conversationId);
            return response.conversation;
        } catch (error: any) {
            return rejectWithValue(error.message || '获取对话详情失败');
        }
    }
);

// 异步Thunk：获取未读消息数
export const fetchUnreadCount = createAsyncThunk(
    'chat/fetchUnreadCount',
    async (_, { rejectWithValue }) => {
        try {
            const response = await getUnreadCount();
            return response.count;
        } catch (error: any) {
            return rejectWithValue(error.message || '获取未读消息数失败');
        }
    }
);

// 初始状态
interface ChatState {
    conversations: Conversation[];
    currentConversation: Conversation | null;
    currentConversationId: number | null;
    unreadCount: number;
    isLoading: boolean;
    error: string | null;
}

const initialState: ChatState = {
    conversations: [],
    currentConversation: null,
    currentConversationId: null,
    unreadCount: 0,
    isLoading: false,
    error: null,
};

// 创建Slice
const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        setCurrentConversation: (state, action) => {
            state.currentConversationId = action.payload;
            // 从现有对话列表中查找详情
            state.currentConversation = state.conversations.find(
                conv => conv.conversation_id === action.payload
            ) || null;
        },
        updateConversationLastMessage: (state, action) => {
            const { conversationId, message } = action.payload;
            const index = state.conversations.findIndex(
                conv => conv.conversation_id === conversationId
            );
            if (index !== -1) {
                state.conversations[index].last_message = message;
                state.conversations[index].updated_at = message.send_time;

                // 如果不是当前对话，增加未读计数
                if (conversationId !== state.currentConversationId) {
                    state.conversations[index].unread_count = (state.conversations[index].unread_count || 0) + 1;
                    state.unreadCount += 1;
                }
            }
        },
        clearConversationUnread: (state, action) => {
            const conversationId = action.payload;
            const index = state.conversations.findIndex(
                conv => conv.conversation_id === conversationId
            );
            if (index !== -1) {
                state.unreadCount -= state.conversations[index].unread_count || 0;
                state.conversations[index].unread_count = 0;
            }
        },
        clearChatError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // 获取对话列表
        builder
            .addCase(fetchConversations.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchConversations.fulfilled, (state, action) => {
                state.isLoading = false;
                state.conversations = action.payload;
                // 计算总未读数
                state.unreadCount = action.payload.reduce(
                    (sum, conv) => sum + (conv.unread_count || 0), 0
                );
            })
            .addCase(fetchConversations.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // 创建对话
        builder
            .addCase(createNewConversation.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(createNewConversation.fulfilled, (state, action) => {
                state.isLoading = false;
                state.conversations.unshift(action.payload);
                state.currentConversation = action.payload;
                state.currentConversationId = action.payload.conversation_id;
            })
            .addCase(createNewConversation.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // 获取对话详情
        builder
            .addCase(fetchConversationDetail.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchConversationDetail.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentConversation = action.payload;

                // 更新对话列表中的对应项
                const index = state.conversations.findIndex(
                    conv => conv.conversation_id === action.payload.conversation_id
                );
                if (index !== -1) {
                    state.conversations[index] = action.payload;
                }
            })
            .addCase(fetchConversationDetail.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // 获取未读消息数
        builder
            .addCase(fetchUnreadCount.fulfilled, (state, action) => {
                state.unreadCount = action.payload;
            });
    },
});

export const {
    setCurrentConversation,
    updateConversationLastMessage,
    clearConversationUnread,
    clearChatError
} = chatSlice.actions;
export default chatSlice.reducer;