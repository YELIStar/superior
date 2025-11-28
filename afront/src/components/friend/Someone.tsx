import React from "react";
import { UserData } from "../../services/APInterface";

const One: React.FC<UserData> = (user) => {
    return (
        <div>
            <div>
                <img src={user.avatar} alt={user.description} />
            </div>
            <div>
                <p>{user.name}</p>
            </div>
        </div>
    )
}
export default One;