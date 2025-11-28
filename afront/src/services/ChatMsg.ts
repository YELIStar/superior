import TransferPrinciple from "./TransferPrinciple.ts";

const ChatMsg = {
    sendPersonMsg: (id: number, msg: string): Promise<any> => {
        return TransferPrinciple(`/chat2/Msg`, {
            method: "POST",
            body: JSON.stringify({
                id: id,
                msg: msg
            })
        })
    },
    sendGroupMsg: (id: number, msg: string): Promise<any> => {
        return TransferPrinciple(`/chat2/Msg`, {
            method: "POST",
            body: JSON.stringify({
                id: id,
                msg: msg
            })
        })
    },
    // getPersonMsg: (id: number): Promise<any> => {
    // return TransferPrinciple()
    // }
}

export default ChatMsg;