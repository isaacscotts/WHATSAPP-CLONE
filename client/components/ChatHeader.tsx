"use client";

import useUserStore from "@/store";
import { FaVideo } from "react-icons/fa";
import { MdCall } from "react-icons/md";
import { FaSearch } from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import Avatar from "./Avatar";
import { useSocketContext } from "@/SocketContext";


const ChatHeader = () => {
  const socket=useSocketContext()
  const { currentChatUser, userInfo,setCallPeerId,setPeerSocketId setIsVideoCall,setIsCalling} = useUserStore();
 
 const startCall=async(audio)=>{
  setIsCalling(true)
  if(!socket || !currentChatUser || !userInfo)  return;
      socket.emit("call-user",{
        from:socket.id,
        to:currentChatUser?.id,
        type:audio?"audio":"video"
      })
      setPeerSocketId(socket.id)

 }
  
  

  return (
    <div className="bg-amber-500 h-15 flex justify-between items-center px-3">
      <Avatar type="sm" image={currentChatUser?.profilePic} />

      <div className="flex gap-4 text-white text-2xl items-center">
        <MdCall className="cursor-pointer" onClick={()=>startCall(true)} />
        <FaVideo className="cursor-pointer" onClick={()=>{
      setCallPeerId(currentChatUser.id)
          
          startCall(false)
        }}/>
        <FaSearch className="cursor-pointer" />
        <BsThreeDotsVertical />
      </div>
    </div>
  );
};

export default ChatHeader;
