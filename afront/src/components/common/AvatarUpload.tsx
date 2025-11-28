import React, { useState } from 'react';
import { Upload, Avatar, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { uploadFile } from '../../api/file';

interface AvatarUploadProps {
    value?: string;
    onChange?: (url: string) => void;
    size?: number;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({
    value,
    onChange,
    size = 100
}) => {
    const [loading, setLoading] = useState(false);

    // 处理头像上传
    const handleUpload = async (file: File) => {
        try {
            setLoading(true);
            const result = await uploadFile(file);
            if (onChange) {
                onChange(result.file_url);
            }
            message.success('头像上传成功');
            return false; // 阻止默认上传
        } catch (error: any) {
            message.error(`上传失败: ${error.message}`);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return (
        <Upload
            name="avatar"
            listType="picture-card"
            className="avatar-uploader"
            showUploadList={false}
            beforeUpload={handleUpload}
        >
            <Avatar
                src={value}
                size={size}
                style={{
                    width: size,
                    height: size,
                    borderRadius: size / 2
                }}
            >
                {loading ? <UploadOutlined spin /> : <UploadOutlined />}
            </Avatar>
        </Upload>
    );
};

export default AvatarUpload;