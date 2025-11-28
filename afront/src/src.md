```text
src/
├── api/                 # API请求封装
│   ├── index.ts         # Axios实例配置（拦截器、基础URL等）
│   ├── user.ts          # 用户相关接口（登录、注册、个人信息）
│   ├── message.ts       # 消息相关接口（发送、获取、撤回）
│   ├── friend.ts        # 好友相关接口（添加、删除、列表）
│   └── conversation.ts  # 对话相关接口（创建、获取对话列表）
├── components/          # 通用组件
│   ├── layout/          # 布局组件（侧边栏、头部等）
│   ├── message/         # 消息相关组件（消息项、输入框）
│   ├── friend/          # 好友相关组件（好友列表项、添加好友弹窗）
│   └── common/          # 通用UI组件（加载中、空状态、错误提示）
├── pages/               # 页面组件
│   ├── Login/           # 登录页
│   ├── Register/        # 注册页
│   ├── Chat/            # 聊天主页（核心页面）
│   ├── Friends/         # 好友管理页
│   └── Profile/         # 个人资料页
├── store/               # Redux状态管理
│   ├── index.ts         #  store配置
│   ├── slices/          # 状态切片
│   │   ├── userSlice.ts # 用户状态（登录信息、个人资料）
│   │   ├── chatSlice.ts # 聊天状态（当前对话、消息列表）
│   │   └── friendSlice.ts # 好友状态（好友列表、分组）
├── types/               # TypeScript类型定义（与后端模型对应）
│   ├── user.ts
│   ├── message.ts
│   ├── friend.ts
│   └── conversation.ts
├── utils/               # 工具函数
│   ├── auth.ts          # JWT令牌存储/获取/删除
│   ├── format.ts        # 时间格式化等工具
│   └── validator.ts     # 表单验证工具
├── App.tsx              # 根组件（路由配置）
└── main.tsx             # 入口文件
```