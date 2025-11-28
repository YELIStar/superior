import React, { useState, useRef } from 'react';
import { Input, Button, Space, Upload, message } from 'antd';
import {
    SendOutlined,
    SmileOutlined,
    PictureOutlined,
    FileOutlined,
    AudioOutlined
} from '@ant-design/icons';
import { useAppDispatch } from '../../store';
import { sendNewMessage } from '../../store/slices/messageSlice';
import { uploadFile } from '../../api/file';
import { MessageType } from '../../types/message';

const { TextArea } = Input;

interface MessageInputProps {
    conversationId: number;
    onSend?: (message: any) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ conversationId, onSend }) => {
    const dispatch = useAppDispatch();
    const [content, setContent] = useState('');
    const [isSending, setIsSending] = useState(false);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // 发送消息
    const handleSend = async () => {
        if (!content.trim() && !uploadingFiles.length) return;

        setIsSending(true);
        try {
            // 先处理文件上传
            if (uploadingFiles.length) {
                for (const file of uploadingFiles) {
                    await handleFileUpload(file);
                }
            }

            // 发送文本消息
            if (content.trim()) {
                const result = await dispatch(sendNewMessage({
                    conversation_id: conversationId,
                    content: content.trim(),
                    type: MessageType.TEXT
                })).unwrap();

                if (onSend) onSend(result);
                setContent('');
            }
        } catch (error: any) {
            message.error(error.message || '发送失败');
        } finally {
            setIsSending(false);
            setUploadingFiles([]);
        }
    };

    // 文件上传状态
    const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);

    // 处理文件上传
    const handleFileUpload = async (file: File) => {
        try {
            const result = await uploadFile(file, conversationId);

            // 根据文件类型发送不同消息
            let messageType: MessageType = MessageType.FILE;
            let messageContent = JSON.stringify({
                url: result.file_url,
                name: file.name,
                size: file.size,
                type: file.type
            });

            // 图片文件
            if (file.type.startsWith('image/')) {
                messageType = MessageType.IMAGE;
                messageContent = result.file_url;
            }

            const messageResult = await dispatch(sendNewMessage({
                conversation_id: conversationId,
                content: messageContent,
                type: messageType
            })).unwrap();

            if (onSend) onSend(messageResult);
            return messageResult;
        } catch (error: any) {
            message.error(`文件上传失败: ${error.message}`);
            throw error;
        }
    };

    // 上传文件前的处理
    const handleBeforeUpload = (file: File) => {
        setUploadingFiles(prev => [...prev, file]);
        return false; // 阻止默认上传
    };

    // 处理键盘事件
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div style={{ borderTop: '1px solid #e8e8e8', padding: '16px' }}>
            {/* 工具栏 */}
            <Space style={{ marginBottom: 8 }}>
                <Upload
                    name="file"
                    beforeUpload={handleBeforeUpload}
                    showUploadList={false}
                    accept="image/*"
                >
                    <Button icon={<PictureOutlined />} size="small" type="text" />
                </Upload>

                <Upload
                    name="file"
                    beforeUpload={handleBeforeUpload}
                    showUploadList={false}
                >
                    <Button icon={<FileOutlined />} size="small" type="text" />
                </Upload>

                <Button icon={<AudioOutlined />} size="small" type="text" />
                <Button icon={<SmileOutlined />} size="small" type="text" />
            </Space>

            {/* 输入框 */}
            <Space.Compact style={{ width: '100%' }}>
                <TextArea
                    ref={inputRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="输入消息..."
                    autoSize={{ minRows: 1, maxRows: 4 }}
                    onPressEnter={handleKeyDown}
                />

                <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSend}
                    loading={isSending}
                    disabled={!content.trim() && uploadingFiles.length === 0}
                >
                    发送
                </Button>
            </Space.Compact>

            {/* 上传中的文件提示 */}
            {uploadingFiles.length > 0 && (
                <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                    正在上传: {uploadingFiles.map(f => f.name).join(', ')}
                </div>
            )}
        </div>
    );
};

export default MessageInput;