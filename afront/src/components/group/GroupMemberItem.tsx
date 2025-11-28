import React from 'react';
import { List, Avatar, Typography, Button, Space, Popconfirm } from 'antd';
import {
    UserOutlined,
    DeleteOutlined,
    CrownOutlined,
    TeamOutlined
} from '@ant-design/icons';
import { GroupMember, GroupRole } from '../../types/group';

const { Text } = Typography;

interface GroupMemberItemProps {
    member: GroupMember;
    isOwner?: boolean;
    currentUserId?: number;
    onRemove?: (userId: number) => void;
    onTransfer?: (userId: number) => void;
}

const GroupMemberItem: React.FC<GroupMemberItemProps> = ({
    member,
    isOwner = false,
    currentUserId,
    onRemove,
    onTransfer
}) => {
    const isCurrentUser = member.user_id === currentUserId;

    return (
        <List.Item>
            <List.Item.Meta
                avatar={
                    <Avatar
                        src={member.user?.avatar}
                        icon={<UserOutlined />}
                    />
                }
                title={
                    <Space>
                        <Text strong>{member.user?.username}</Text>

                        {member.role === GroupRole.OWNER && (
                            <CrownOutlined style={{ color: '#f56a00' }} />
                        )}

                        {member.role === GroupRole.ADMIN && (
                            <TeamOutlined style={{ color: '#1890ff' }} />
                        )}
                    </Space>
                }
                description={
                    <Text type="secondary">
                        ID: {member.user_id} · 加入时间: {member.joined_at.split('T')[0]}
                    </Text>
                }
            />

            {isOwner && !isCurrentUser && (
                <Space>
                    {member.role !== GroupRole.OWNER && (
                        <Popconfirm
                            title="确定转让群主吗？"
                            onConfirm={() => onTransfer && onTransfer(member.user_id)}
                            okText="是"
                            cancelText="否"
                        >
                            <Button
                                type="text"
                                icon={<CrownOutlined />}
                                size="small"
                            >
                                转让群主
                            </Button>
                        </Popconfirm>
                    )}

                    <Popconfirm
                        title="确定移出群聊吗？"
                        onConfirm={() => onRemove && onRemove(member.user_id)}
                        okText="是"
                        cancelText="否"
                    >
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            size="small"
                        >
                            移出
                        </Button>
                    </Popconfirm>
                </Space>
            )}
        </List.Item>
    );
};

export default GroupMemberItem;