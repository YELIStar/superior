import React from 'react';
import '../assets/Hero.css';

const Hero: React.FC = () => {
    return (
        <section className="hero">
            <div className="hero-container">
                <div className="hero-content">
                    <h1 className="hero-title">欢迎来到我们的网站</h1>
                    <p className="hero-subtitle">
                        这是一个现代化的React TypeScript应用程序，展示了基本的前端开发技术和最佳实践。
                    </p>
                    <div className="hero-buttons">
                        <button className="btn btn-primary">开始探索</button>
                        <button className="btn btn-secondary">了解更多</button>
                    </div>
                </div>
                <div className="hero-image">
                    <div className="placeholder-image">
                        <span>🚀</span>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;