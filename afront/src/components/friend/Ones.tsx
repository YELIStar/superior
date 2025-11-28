import React from "react";
import One from "./Someone";
import { Link } from "react-router-dom";
import { UserData } from "../../services/APInterface";

const Ones: React.FC = () => {
    const friends: UserData[] = [
        { id: 1, name: "John", avatar: "url", description: "description", status: "status" },
        { id: 2, name: "Jane", avatar: "url", description: "description", status: "status" },
    ]
    return (
        <div id="Friends">
            {friends.map((one) => (
                <Link to={`/showsomeone/${one.id}`} key={one.id}>
                    <One {...one} />
                </Link>
            ))}
        </div>
    )
}

export default Ones;