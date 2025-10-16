import React from 'react';
import '../assets/Features.css';

interface Feature {
    icon: string;
    title: string;
    description: string;
}

const Features: React.FC = () => {
    const features: Feature[] = [
        {
            icon: '⚡',
            title: '快速开发',
            description: '使用现代化的React框架和Vite构建工具，提供极快的开发体验。'
        },
        {
            icon: '🎨',
            title: '美观设计',
            description: '采用现代化的UI设计理念，提供优雅的用户界面和良好的用户体验。'
        },
        {
            icon: '📱',
            title: '响应式布局',
            description: '完全响应式设计，在各种设备和屏幕尺寸上都能完美显示。'
        },
        {
            icon: '🔧',
            title: '易于维护',
            description: '模块化的组件结构和清晰的代码组织，便于后续维护和扩展。'
        },
        {
            icon: '🚀',
            title: '高性能',
            description: '优化的代码结构和现代化的构建工具，确保应用程序的高性能运行。'
        },
        {
            icon: '🌍',
            title: '跨平台',
            description: '基于Web技术构建，可以在任何支持现代浏览器的平台上运行。'
        }
    ];

    return (
        <section className="features">
            <div className="features-container">
                <div className="features-header">
                    <h2>核心特性</h2>
                    <p>我们的项目具备以下核心特性和优势</p>
                </div>
                <div className="features-grid">
                    {features.map((feature, index) => (
                        <div key={index} className="feature-card">
                            <div className="feature-icon">{feature.icon}</div>
                            <h3>{feature.title}</h3>
                            <p>{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;