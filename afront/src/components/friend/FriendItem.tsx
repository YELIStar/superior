import React from 'react';
import { List, Avatar, Typography, Button, Space, Popconfirm } from 'antd';
import {
    UserOutlined,
    DeleteOutlined,
    MessageOutlined,
    MoreOutlined
} from '@ant-design/icons';
import { Friend } from '../../types/friends';
import { formatRelativeTime } from '../../utils/format';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store';
import { deleteFriendById } from '../../store/slices/friendSlice';

const { Text, Title } = Typography;

interface FriendItemProps {
    friend: Friend;
    onDelete?: (friendId: number) => void;
    onClick?: () => void;
}

const FriendItem: React.FC<FriendItemProps> = ({ friend, onDelete, onClick }) => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    // 开始聊天
    const handleChat = () => {
        navigate(`/chat?friend=${friend.friend_id}`);
    };

    // 删除好友
    const handleDelete = async () => {
        try {
            await dispatch(deleteFriendById(friend.friend_id)).unwrap();
            if (onDelete) onDelete(friend.friend_id);
        } catch (error) {
            console.error('删除好友失败:', error);
        }
    };

    return (
        <List.Item
            onClick={onClick}
            actions={[
                <Button
                    type="text"
                    icon={<MessageOutlined />}
                    onClick={handleChat}
                >
                    聊天
                </Button>,
                <Popconfirm
                    title="确定删除该好友吗？"
                    onConfirm={handleDelete}
                    okText="是"
                    cancelText="否"
                >
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                    >
                        删除
                    </Button>
                </Popconfirm>
            ]}
        >
            <List.Item.Meta
                avatar={
                    <Avatar
                        src={friend.friend_info.avatar}
                        icon={<UserOutlined />}
                    />
                }
                title={
                    <Space>
                        <Title level={5} style={{ margin: 0 }}>
                            {friend.remark || friend.friend_info.username}
                        </Title>

                        {friend.friend_info.status === 1 ? (
                            <Text type="success" style={{ fontSize: 12 }}>在线</Text>
                        ) : (
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                最后活跃: {formatRelativeTime(friend.friend_info.last_login)}
                            </Text>
                        )}
                    </Space>
                }
                description={
                    <Space>
                        <Text type="secondary">
                            {friend.friend_info.phone || friend.friend_info.email || '暂无联系方式'}
                        </Text>
                    </Space>
                }
            />
        </List.Item>
    );
};

export default FriendItem;