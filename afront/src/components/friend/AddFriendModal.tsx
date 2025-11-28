import React, { useState } from 'react';
import { Modal, Form, Input, Button, Select, message } from 'antd';
import { useAppDispatch, useAppSelector } from '../../store';
import { addNewFriend } from '../../store/slices/friendSlice';
import { FriendGroup } from '../../types/friends';

interface AddFriendModalProps {
    visible: boolean;
    onCancel: () => void;
    onSuccess?: () => void;
}

const AddFriendModal: React.FC<AddFriendModalProps> = ({
    visible,
    onCancel,
    onSuccess
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const dispatch = useAppDispatch();
    const { groups } = useAppSelector(state => state.friend);

    // 提交表单
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            await dispatch(addNewFriend({
                friend_id: parseInt(values.friendId),
                group_id: values.groupId,
                remark: values.remark,
                message: values.message
            })).unwrap();

            message.success('好友请求已发送');
            form.resetFields();
            onCancel();
            if (onSuccess) onSuccess();
        } catch (error: any) {
            message.error(error.message || '添加失败');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="添加好友"
            open={visible}
            onCancel={onCancel}
            footer={[
                <Button key="cancel" onClick={onCancel}>取消</Button>,
                <Button
                    key="submit"
                    type="primary"
                    loading={loading}
                    onClick={handleSubmit}
                >
                    发送请求
                </Button>
            ]}
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="friendId"
                    label="好友ID/手机号/邮箱"
                    rules={[{ required: true, message: '请输入好友ID/手机号/邮箱' }]}
                >
                    <Input placeholder="请输入好友ID/手机号/邮箱" />
                </Form.Item>

                <Form.Item
                    name="remark"
                    label="好友备注"
                >
                    <Input placeholder="选填，设置好友备注名" />
                </Form.Item>

                <Form.Item
                    name="groupId"
                    label="分组"
                    rules={[{ required: true, message: '请选择分组' }]}
                >
                    <Select placeholder="选择分组">
                        {groups.map(group => (
                            <Select.Option key={group.group_id} value={group.group_id}>
                                {group.group_name}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="message"
                    label="验证消息"
                >
                    <Input.TextArea
                        placeholder="选填，告诉对方你是谁"
                        rows={3}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AddFriendModal;