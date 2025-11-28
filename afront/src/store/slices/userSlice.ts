import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { User, LoginRequest, RegisterRequest } from '../../types/user';
import { login, register, getProfile, updateProfile, changePassword } from '../../api/user';
import { saveTokens, clearAuthData, saveUserInfo } from '../../utils/auth';

// 异步Thunk：用户登录
export const loginUser = createAsyncThunk(
    'user/login',
    async (params: LoginRequest, { rejectWithValue }) => {
        try {
            const response = await login(params);
            await saveTokens(response.access_token, response.refresh_token);
            await saveUserInfo(response.user);
            return response.user;
        } catch (error: any) {
            return rejectWithValue(error.message || '登录失败');
        }
    }
);

// 异步Thunk：用户注册
export const registerUser = createAsyncThunk(
    'user/register',
    async (params: RegisterRequest, { rejectWithValue }) => {
        try {
            const response = await register(params);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || '注册失败');
        }
    }
);

// 异步Thunk：获取用户信息
export const fetchUserProfile = createAsyncThunk(
    'user/fetchProfile',
    async (_, { rejectWithValue }) => {
        try {
            const response = await getProfile();
            await saveUserInfo(response.user);
            return response.user;
        } catch (error: any) {
            return rejectWithValue(error.message || '获取用户信息失败');
        }
    }
);

// 异步Thunk：更新用户资料
export const updateUserProfile = createAsyncThunk(
    'user/updateProfile',
    async (params: Partial<User>, { rejectWithValue }) => {
        try {
            const response = await updateProfile(params);
            await saveUserInfo(response);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || '更新资料失败');
        }
    }
);

// 异步Thunk：修改密码
export const changeUserPassword = createAsyncThunk(
    'user/changePassword',
    async (params: { old_password: string; new_password: string }, { rejectWithValue }) => {
        try {
            const response = await changePassword(params);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || '修改密码失败');
        }
    }
);

// 初始状态
interface UserState {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    isAuthenticated: boolean;
}

const initialState: UserState = {
    user: null,
    isLoading: false,
    error: null,
    isAuthenticated: false,
};

// 创建Slice
const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        logoutUser: (state) => {
            clearAuthData();
            state.user = null;
            state.isAuthenticated = false;
        },
        clearUserError: (state) => {
            state.error = null;
        },
        setUserStatus: (state, action) => {
            if (state.user) {
                state.user.status = action.payload;
            }
        },
    },
    extraReducers: (builder) => {
        // 登录
        builder
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // 注册
        builder
            .addCase(registerUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // 获取用户信息
        builder
            .addCase(fetchUserProfile.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchUserProfile.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(fetchUserProfile.rejected, (state) => {
                state.isLoading = false;
                state.isAuthenticated = false;
            });

        // 更新用户资料
        builder
            .addCase(updateUserProfile.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(updateUserProfile.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload;
            })
            .addCase(updateUserProfile.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // 修改密码
        builder
            .addCase(changeUserPassword.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(changeUserPassword.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(changeUserPassword.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { logoutUser, clearUserError, setUserStatus } = userSlice.actions;
export default userSlice.reducer;