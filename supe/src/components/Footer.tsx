import React from 'react';
import '../assets/Footer.css';

const Footer: React.FC = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-content">
                    <div className="footer-section">
                        <h3>关于我们</h3>
                        <p>这是一个基本的React TypeScript前端项目，包含了现代化的组件结构和样式设计。</p>
                    </div>
                    <div className="footer-section">
                        <h3>快速链接</h3>
                        <ul>
                            <li><a href="#home">首页</a></li>
                            <li><a href="#about">关于</a></li>
                            <li><a href="#services">服务</a></li>
                            <li><a href="#contact">联系</a></li>
                        </ul>
                    </div>
                    <div className="footer-section">
                        <h3>联系信息</h3>
                        <p>邮箱: contact@example.com</p>
                        <p>电话: (42534) 456-7890</p>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2024 前端项目. 保留所有权利.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;