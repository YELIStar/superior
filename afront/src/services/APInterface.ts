export interface MsgData {
    senderId: number,
    msg: string,
    date: Date,
    receiverId: number | string
}

export interface UserData {
    id: number,
    name: string,
    avatar: string,
    description: string,
    status: string
}
