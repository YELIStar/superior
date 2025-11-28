import React from 'react';
import { Spin, Typography, Space } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

interface LoadingProps {
    tip?: string;
    size?: 'small' | 'middle' | 'large';
    fullscreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({
    tip = '加载中...',
    size = 'middle',
    fullscreen = false
}) => {
    const containerStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        ...(fullscreen ? {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(255,255,255,0.8)',
            zIndex: 9999
        } : {})
    };

    return (
        <div style={containerStyle}>
            <Space direction="vertical" align="center">
                <Spin
                    indicator={<LoadingOutlined style={{ fontSize: size === 'large' ? 32 : 24 }} spin />}
                    size={size === 'middle' ? 'default' : size}
                />
                {tip && (
                    <Typography.Text type="secondary" style={{ marginTop: 16 }}>
                        {tip}
                    </Typography.Text>
                )}
            </Space>
        </div>
    );
};

export default Loading;