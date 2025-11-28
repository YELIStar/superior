import React, { useState } from "react";
import { } from "react-router-dom";

const ChatFrame: React.FC = () => {
    const [message, setMessage] = useState<string>('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim()) {
            // 这里可以添加发送消息的逻辑
            console.log('发送消息:', message);
            setMessage('');
        }
    };

    return (
        <div className="chat-frame">
            <form onSubmit={handleSubmit}>
                <textarea
                    name="chatContent"
                    id="chatTextArea"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="请输入消息..."
                />
                <button type="submit">发送</button>
            </form>
        </div>
    );
};

export default ChatFrame;