import React from "react";
import { Link } from "react-router-dom";

const Navigation: React.FC = () => {
    return (
        <header className="y-header">
            <div className="y-header-logo">FAH</div>
            <nav className="y-header-nav">
                <Link to="/">信封</Link>
                <Link to="/friends">流星</Link>
                <Link to="/life">台灯</Link>
                <Link to="/profile">书桌</Link>
            </nav>
        </header>
    );
};

export default Navigation;