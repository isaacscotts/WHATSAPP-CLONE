"use client"

import useUserStore from "@/store";
import ImageMessage from "./ImageMessage";
import VoiceMessage from "./VoiceMessage";

const ChatContainer=()=>{
    const {messages,currentChatUser}=useUserStore()
    return (
        <div className="bg-black  flex-1 overflow-y-auto  flex-col gap-2 text-white">
        {messages.map((message,index)=>(
            <div key={index} className={`flex  ${currentChatUser?.id===message.senderId?"justify-start":"justify-end"}`}>
                <div className={`flex ${currentChatUser?.id===message.senderId?'bg-amber-700':'bg-blue-600'}`}>
                    {message.type==="text" && <span>{message?.message}</span>}
                    {message.type==="image" && <ImageMessage message={message?.message}/>}
                    {message.type==="audio" && <VoiceMessage message={message}/>}
                </div>
                </div>
        ))}
        
        </div>
    )
}

export default ChatContainer;