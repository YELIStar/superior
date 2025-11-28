import React, { useState } from 'react';
import { Collapse, List, Typography, Button, Space } from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    EditOutlined
} from '@ant-design/icons';
import { FriendGroup as FriendGroupType, Friend } from '../../types/friends';
import FriendItem from './FriendItem';

const { Panel } = Collapse;
const { Title } = Typography;

interface FriendGroupProps {
    group: FriendGroupType;
    friends: Friend[];
    onDeleteGroup?: (groupId: number) => void;
    onRenameGroup?: (groupId: number, name: string) => void;
    onDeleteFriend?: (friendId: number) => void;
    onSelectFriend?: (friendId: number) => void;
}

const FriendGroup: React.FC<FriendGroupProps> = ({
    group,
    friends,
    onDeleteGroup,
    onRenameGroup,
    onDeleteFriend,
    onSelectFriend
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState(group.group_name);

    // 自定义面板头
    const renderPanelHeader = () => {
        return (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {isEditing ? (
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onBlur={() => {
                                if (newName.trim() && newName !== group.group_name) {
                                    onRenameGroup && onRenameGroup(group.group_id, newName.trim());
                                }
                                setIsEditing(false);
                            }}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    if (newName.trim() && newName !== group.group_name) {
                                        onRenameGroup && onRenameGroup(group.group_id, newName.trim());
                                    }
                                    setIsEditing(false);
                                }
                            }}
                            style={{
                                border: '1px solid #1890ff',
                                borderRadius: 4,
                                padding: '4px 8px',
                                width: 150
                            }}
                            autoFocus
                        />
                    ) : (
                        <Title level={5} style={{ margin: 0 }}>
                            {group.group_name} ({friends.length})
                        </Title>
                    )}
                </div>

                <Space>
                    {!isEditing && (
                        <>
                            <Button
                                type="text"
                                icon={<EditOutlined />}
                                size="small"
                                onClick={() => {
                                    setNewName(group.group_name);
                                    setIsEditing(true);
                                }}
                            />
                            <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                size="small"
                                onClick={() => onDeleteGroup && onDeleteGroup(group.group_id)}
                            />
                        </>
                    )}
                </Space>
            </div>
        );
    };

    return (
        <Panel
            header={renderPanelHeader()}
            key={group.group_id}
            showArrow
        >
            <List
                dataSource={friends}
                renderItem={(friend) => (
                    <FriendItem
                        key={friend.friend_id}
                        friend={friend}
                        onDelete={onDeleteFriend}
                        onClick={() => onSelectFriend && onSelectFriend(friend.friend_id)}
                    />
                )}
            />
        </Panel>
    );
};

export default FriendGroup;