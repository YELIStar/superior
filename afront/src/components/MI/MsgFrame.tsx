import React, { useState } from "react";
import { Link } from "react-router-dom";

const MsgFrame: React.FC = () => {
    const id = 13234;
    const msg = "hello world";
    return (
        <div>
            <div id="ChatMsg">
                <Link to="/showsomeone">
                    <img src="path/to/your/image.jpg" alt="Description" />
                </Link>
                <div id="Msg">{msg}</div>
            </div>
        </div>
    )
}
export default MsgFrame;