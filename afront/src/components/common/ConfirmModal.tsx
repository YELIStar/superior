import React from 'react';
import { Modal, Button } from 'antd';

interface ConfirmModalProps {
    visible: boolean;
    title?: string;
    content?: React.ReactNode;
    okText?: string;
    cancelText?: string;
    onOk: () => void;
    onCancel: () => void;
    danger?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    visible,
    title = '确认操作',
    content = '确定要执行此操作吗？',
    okText = '确定',
    cancelText = '取消',
    onOk,
    onCancel,
    danger = false
}) => {
    return (
        <Modal
            title={title}
            open={visible}
            onOk={onOk}
            onCancel={onCancel}
            okText={okText}
            cancelText={cancelText}
            okButtonProps={{ danger }}
            maskClosable={false}
        >
            {content}
        </Modal>
    );
};

export default ConfirmModal;