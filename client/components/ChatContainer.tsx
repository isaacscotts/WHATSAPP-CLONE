"use client"

import useUserStore from "@/store";
import ImageMessage from "./ImageMessage";
import VoiceMessage from "./VoiceMessage";
import TextMessage from "./TextMessage";
import { useEffect } from "react";
import { useSocketContext } from "@/SocketContext";

const ChatContainer=()=>{
    const {messages,currentChatUser,userInfo}=useUserStore()
    const socket=useSocketContext()


    useEffect(()=>{
        if(!currentChatUser || !socket) return;

        const unreadMessages=messages.filter((m)=>
         m.senderId===currentChatUser.id && 
        m.status !=="read"
        );

        if(unreadMessages.length>0){
            socket.emit("msg-read",{
                from:currentChatUser.id,
                to:userInfo.id,
                messageIds:unreadMessages.map(m=>m.id)
            })
        }
    },[currentChatUser,messages])
    return (
        <div className="bg-black pt-1  flex-1 overflow-y-auto  flex-col gap-2 text-white">
        {messages.map((message,index)=>(
            <div key={index} className={`flex mb-1 ${currentChatUser?.id===message.senderId?"justify-start":"justify-end"}`}>
                <div className={`flex rounded ${currentChatUser?.id===message.senderId?'bg-gray-600 ':'bg-green-900'}`}>
                    {message.type==="text" && <TextMessage message={message}/>}
                    {message.type==="image" && <ImageMessage message={message}/>}
                    {message.type==="audio" && <VoiceMessage message={message}/>}
                </div>
                </div>
        ))}
        
        </div>
    )
}

export default ChatContainer;