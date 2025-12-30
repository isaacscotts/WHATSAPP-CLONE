"use client"
import { CiFaceSmile } from "react-icons/ci";
import { RiAttachment2 } from "react-icons/ri";
import { IoMdSend } from "react-icons/io";
import { FaMicrophone } from "react-icons/fa";
import { useState,useRef, useEffect } from "react";
import { addImageMessage, addMessage } from "@/utils/ApiRoutes";
import useUserStore from "@/store";
import EmojiPicker from 'emoji-picker-react';
import SendMessagePicker from "./SendImageMessagePicker";
import { useSocketContext } from "@/SocketContext";
import CaptureAudio from "./CaptureAudio";
import CaptureSolid from "./CaptureSolid"
import Capture from "./CapturePro";

const MessageBar=()=>{
    const {currentChatUser,userInfo,addMessager}=useUserStore()
    const emojiPickerRef=useRef(null)
    const socket=useSocketContext()
    const [message,setMessage]=useState('')
    const [voiceRecording,setVoiceRecording]=useState(false)
    const [showEmoji,setShowEmoji]=useState(false)
    const [grabPhoto,setGrabPhoto]=useState(false)
    const sendMessage=async ()=>{
      const response=await fetch(addMessage,{
        method:"post",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({message,from:userInfo?.id,to:currentChatUser?.id})
      })
      const dataResponse=await response.json()
      addMessager(dataResponse?.data)
      socket.emit("msg-send",{
        from:userInfo?.id,
        to:currentChatUser?.id,
        message:dataResponse?.data
      })
      setMessage("")
      console.log(dataResponse)
     
}
const handleEmojiClick=(emoji)=>{
   setMessage((prev)=>prev+=emoji.emoji)
}

const OnChange=async(e)=>{
  try{
    
    const file=e.target.files[0]
    console.log(file)
    const formData=new FormData()
    formData.append('image',file)
    const response=await fetch(`${addImageMessage}/${userInfo?.id}/${currentChatUser?.id}`,{
      method:"post",
      body:formData
    })

    const dataResponse=await response.json()
    addMessager(dataResponse?.newMessage)
    socket.emit('msg-send',{
      from:userInfo?.id,
      to:currentChatUser?.id,
      message:dataResponse?.newMessage
    })
    console.log(dataResponse)
    
  }
  catch(err){
    console.log(err)
  }
}

useEffect(()=>{
   const handleOutsideClick=(event)=>{
      if(event.target.id!=="emoji-picker"){
        if(emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)){
            setShowEmoji(false)
        }
      }
   }

   document.addEventListener('click',handleOutsideClick)

   return ()=>{
    document.removeEventListener('click',handleOutsideClick)
   }
},[])
const toggleModal=(e)=>{
    e.stopPropagation()
    setShowEmoji(!showEmoji)
}
   return (<div className="h-16 justify-center">
      {!voiceRecording && (
          <div className="flex h-full justify-center ">
            <div className="flex text-2xl flex-1 gap-3 bg-pink-600 items-center text-white">
        <div  className="cursor-pointer"><CiFaceSmile id="emoji-picker" onClick={(e)=>toggleModal(e)}/>
        {showEmoji&&(<div className="absolute top-[20%] left-[35%]" ref={emojiPickerRef}>
            <EmojiPicker  onEmojiClick={(emoji)=>handleEmojiClick(emoji)}/>
            </div>)}
        </div> 
         <div onClick={()=>setGrabPhoto(!grabPhoto)}>
             <RiAttachment2 className="cursor-pointer"/>
         </div>
         {grabPhoto && (
          <SendMessagePicker onChange={OnChange} setGrabPhoto={setGrabPhoto}/>
         )}
      

    </div>
    
   <div className="bg-blue-500 flex flex-7 items-center"> <input type="text" value={message} onChange={(e)=>setMessage(e.target.value)} className="w-full p-2 text-white focus:outline-none" placeholder="Type a message"/></div>
    <div className="bg-teal-600 flex flex-1 justify-end pr-2 items-center text-2xl">
      {message?.length? (<IoMdSend title="send message" className="cursor-pointer" onClick={()=>sendMessage()}/>)
      :(<FaMicrophone onClick={()=>setVoiceRecording(!voiceRecording)} className="cursor-pointer" title="microphone"/>)
      }
      
      
      
      </div>
          </div>
      )}

      {voiceRecording && (
       // <CaptureAudio/>
       <Capture start={true} hide={()=>setVoiceRecording(false)}/>
      
      
      )}


   </div>)
}
export default MessageBar;