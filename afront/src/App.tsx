import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { useAppSelector } from './store';

// 页面组件
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';
import Friends from './pages/Friends';
import Groups from './pages/Groups';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';

// 全局样式
import './assets/global.css';

// 私有路由组件（需要认证）
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAppSelector(state => state.user);
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
    return (
        <ConfigProvider locale={zhCN}>
            <BrowserRouter>
                <Routes>
                    {/* 公开路由 */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* 私有路由 */}
                    <Route
                        path="/chat"
                        element={
                            <PrivateRoute>
                                <Chat />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/friends"
                        element={
                            <PrivateRoute>
                                <Friends />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/groups"
                        element={
                            <PrivateRoute>
                                <Groups />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <PrivateRoute>
                                <Profile />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/notifications"
                        element={
                            <PrivateRoute>
                                <Notifications />
                            </PrivateRoute>
                        }
                    />

                    {/* 默认路由重定向 */}
                    <Route path="/" element={<Navigate to="/chat" replace />} />
                    <Route path="*" element={<Navigate to="/chat" replace />} />
                </Routes>
            </BrowserRouter>
        </ConfigProvider>
    );
};

export default App;