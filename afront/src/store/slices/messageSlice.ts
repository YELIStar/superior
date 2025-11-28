import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Message, SendMessageRequest } from '../../types/message';
import { getMessages, sendMessage, recallMessage, markMessagesAsRead } from '../../api/messages';
import { updateConversationLastMessage, clearConversationUnread } from './chatSlice';

// 异步Thunk：获取消息列表
export const fetchMessages = createAsyncThunk(
    'message/fetchMessages',
    async (params: { conversationId: number; offset?: number; limit?: number }, { rejectWithValue }) => {
        try {
            const response = await getMessages(params.conversationId, {
                offset: params.offset,
                limit: params.limit,
            });
            return {
                messages: response.messages,
                conversationId: params.conversationId,
            };
        } catch (error: any) {
            return rejectWithValue(error.message || '获取消息失败');
        }
    }
);

// 异步Thunk：发送消息
export const sendNewMessage = createAsyncThunk(
    'message/sendNewMessage',
    async (params: SendMessageRequest, { dispatch, rejectWithValue }) => {
        try {
            const response = await sendMessage(params);
            // 更新对话的最后一条消息
            dispatch(updateConversationLastMessage({
                conversationId: params.conversation_id,
                message: response,
            }));
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || '发送消息失败');
        }
    }
);

// 异步Thunk：撤回消息
export const recallMessageById = createAsyncThunk(
    'message/recallMessage',
    async (params: { messageId: number; conversationId: number }, { rejectWithValue }) => {
        try {
            await recallMessage(params.messageId);
            return {
                messageId: params.messageId,
                conversationId: params.conversationId,
            };
        } catch (error: any) {
            return rejectWithValue(error.message || '撤回消息失败');
        }
    }
);

// 异步Thunk：标记消息已读
export const markMessagesRead = createAsyncThunk(
    'message/markMessagesRead',
    async (conversationId: number, { dispatch, rejectWithValue }) => {
        try {
            await markMessagesAsRead(conversationId);
            dispatch(clearConversationUnread(conversationId));
            return conversationId;
        } catch (error: any) {
            return rejectWithValue(error.message || '标记已读失败');
        }
    }
);

// 初始状态
interface MessageState {
    messages: Message[];
    currentConversationMessages: Message[];
    isLoading: boolean;
    error: string | null;
    isSending: boolean;
}

const initialState: MessageState = {
    messages: [],
    currentConversationMessages: [],
    isLoading: false,
    error: null,
    isSending: false,
};

// 创建Slice
const messageSlice = createSlice({
    name: 'message',
    initialState,
    reducers: {
        clearMessages: (state) => {
            state.currentConversationMessages = [];
        },
        addNewMessage: (state, action) => {
            state.currentConversationMessages.push(action.payload);
            state.messages.push(action.payload);
        },
        updateMessageStatus: (state, action) => {
            const { messageId, status } = action.payload;
            const index = state.currentConversationMessages.findIndex(
                msg => msg.message_id === messageId
            );
            if (index !== -1) {
                state.currentConversationMessages[index].status = status;
            }

            const globalIndex = state.messages.findIndex(
                msg => msg.message_id === messageId
            );
            if (globalIndex !== -1) {
                state.messages[globalIndex].status = status;
            }
        },
        clearMessageError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // 获取消息
        builder
            .addCase(fetchMessages.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchMessages.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentConversationMessages = action.payload.messages;
                state.messages = [...state.messages, ...action.payload.messages];
            })
            .addCase(fetchMessages.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // 发送消息
        builder
            .addCase(sendNewMessage.pending, (state) => {
                state.isSending = true;
            })
            .addCase(sendNewMessage.fulfilled, (state, action) => {
                state.isSending = false;
                state.currentConversationMessages.push(action.payload);
                state.messages.push(action.payload);
            })
            .addCase(sendNewMessage.rejected, (state, action) => {
                state.isSending = false;
                state.error = action.payload as string;
            });

        // 撤回消息
        builder
            .addCase(recallMessageById.fulfilled, (state, action) => {
                const { messageId } = action.payload;
                const index = state.currentConversationMessages.findIndex(
                    msg => msg.message_id === messageId
                );
                if (index !== -1) {
                    state.currentConversationMessages[index].is_recalled = true;
                }

                const globalIndex = state.messages.findIndex(
                    msg => msg.message_id === messageId
                );
                if (globalIndex !== -1) {
                    state.messages[globalIndex].is_recalled = true;
                }
            });
    },
});

export const { clearMessages, addNewMessage, updateMessageStatus, clearMessageError } = messageSlice.actions;
export default messageSlice.reducer;