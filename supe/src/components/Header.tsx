import React from 'react';
import '../assets/Header.css';

const Header: React.FC = () => {
    return (
        <header className="header">
            <div className="header-container">
                <div className="logo">
                    <h1>前端项目</h1>
                </div>
                <nav className="nav">
                    <ul className="nav-list">
                        <li><a href="#home">首页</a></li>
                        <li><a href="#about">关于</a></li>
                        <li><a href="#services">服务</a></li>
                        <li><a href="#contact">联系</a></li>
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;