import React from "react";
import { Link } from "react-router-dom";
import MsgFrame from "./MsgFrame";
import ChatFrame from "./ChatFrame";

const MainInterface: React.FC = () => {
    return (
        <div>
            <MsgFrame />
            <ChatFrame />
        </div>
    );
};
export default MainInterface;