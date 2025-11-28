import React from 'react';
import { Typography, Button, Result } from 'antd';
import { SmileOutlined } from '@ant-design/icons';

interface EmptyProps {
    description?: string;
    image?: string;
    buttonText?: string;
    buttonIcon?: React.ReactNode;
    onButtonClick?: () => void;
}

const Empty: React.FC<EmptyProps> = ({
    description = '暂无数据',
    image,
    buttonText,
    buttonIcon,
    onButtonClick
}) => {
    return (
        <Result
            icon={<SmileOutlined style={{ fontSize: 48, color: '#ccc' }} />}
            title={description}
            subTitle=""
            extra={
                buttonText && onButtonClick ? (
                    <Button
                        type="primary"
                        icon={buttonIcon}
                        onClick={onButtonClick}
                    >
                        {buttonText}
                    </Button>
                ) : null
            }
            style={{ padding: '40px 0' }}
        />
    );
};

export default Empty;