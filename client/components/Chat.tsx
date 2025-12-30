"use client"
import ChatHeader from "./ChatHeader";
import ChatContainer from "./ChatContainer";
import MessageBar from "./MessageBar";
import useUserStore from "@/store";
import VideoCall from "./VideoCall";
import { useEffect, useRef,useState } from "react";
import { MdCallEnd } from "react-icons/md";
import { useSocketContext } from "@/SocketContext";
import Avatar from "./Avatar";
import AudioCall from "./AudioCall";




const Chat = () => {
  const {isVideoCall,incomingCall,setIsAudioCall,isAudioCall,setIsCalling,isCalling,userInfo,setIsVideoCall,currentChatUser,setIncomingCall}=useUserStore()
  const socket=useSocketContext()
  const ringRef=useRef(null)
  const  [audioUnlocked,setAudioUnlocked]=useState(false)
  
  useEffect(() => {
  if (!ringRef.current) {
    const audio = new Audio("/sounds/with-you.mp3")
    audio.loop = true
    ringRef.current = audio
  }
}, [])

  const stopRing = () => {
  if (!ringRef.current) return
  ringRef.current.pause()
  ringRef.current.currentTime = 0
}

    console.log('incoming',incomingCall)
 
    useEffect(()=>{
      
    const unlocked=sessionStorage.getItem("audio-unlocked")
    if(unlocked==="true"){
      setAudioUnlocked(true)
    }
    },[])
   const unlockAudio=()=>{ 
    if(!ringRef.current){
    ringRef.current=new Audio('/sounds/with-you.mp3')
      ringRef.current.loop=true
    }
      ringRef.current.play().then(()=>{
        ringRef.current.pause()
        ringRef.current.currentTime=0
        sessionStorage.setItem("audio-unlocked","true")
        setAudioUnlocked(true)
      }).catch(()=>{})
   }

   // ringtone control
   useEffect(()=>{
    if(!audioUnlocked ||!ringRef.current ) return
      if(incomingCall) {
        ringRef.current.currentTime=0
         
        ringRef.current.play().catch(()=>{})
      } else{
        ringRef.current.pause()
        ringRef.current.currentTime=0
      }

      return ()=>{
           ringRef.current?.pause()
           ringRef.current!.currentTime=0
      
      } 
 
   },[incomingCall,audioUnlocked])


  useEffect(()=>{
     if(!socket || !userInfo || !currentChatUser) return;
     
  },[socket])
  return (
    <div className="relative w-full h-screen flex flex-col overflow-hidden">
      {!audioUnlocked && (
  <div
    onClick={unlockAudio}
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 text-white cursor-pointer"
  >
    Tap anywhere to enable call sounds
  </div>
)}
      <ChatHeader />
      <ChatContainer />
      <MessageBar />
          {isCalling && (
          <div className="absolute inset-0 z-30   bg-gray-900/70">
             
                <div className="flex items-center justify-center pt-4 pb-4"><span className="text-white">Calling {currentChatUser?.username}</span></div>
               <div className="flex flex-col h-full items-center justify-center">
               <Avatar type={"c"} image={currentChatUser?.profilePic}/>
               <div><span className="p-4 text-7xl text-red-600"><MdCallEnd onClick={()=>{
                socket.emit("call-cancel",{
                  from:userInfo?.id,
                  to:currentChatUser?.id
                })
                setIsCalling(false)
          
                
               }} /></span></div>
            </div>
          </div>
        )}
        {incomingCall && (
          <div className="absolute inset-0 z-30  flex flex-col items-center justify-center bg-gray-900/70">
           
             <div className="flex gap-5 flex-col text-amber-50">
             
               <span> Incoming  {incomingCall.type==="video"?"Video Call":"Audio Call"} from  </span>
                <div className="flex gap-2">
                       <button onClick={()=>{
                 stopRing()
                socket.emit("call-accepted",{from:userInfo?.id,to:incomingCall?.from,type:incomingCall?.type})
                if(incomingCall?.type==="video"){
setIsVideoCall(true)
                } else{
                  setIsAudioCall(true)
                }
                
               }}  className="bg-green-500 text-white w-18 h-18">Accept</button>
             <button onClick={()=>{
             stopRing()
           socket.emit('call-rejected',{
            to:incomingCall?.from,
            from:userInfo?.id
           })
           setIsVideoCall(false)
           setIncomingCall(null)
             }} className="bg-red-500 text-white w-18 h-18">Reject</button>
                </div>
              
             </div>
            
          </div>
        )} 

       {console.log("incoming",incomingCall)}
        {isVideoCall && (<VideoCall isCaller={!incomingCall?.from}/>)}       

        {isAudioCall && (<AudioCall isCaller={!incomingCall?.from}/>)}
        </div>
      
    
  );
};

export default Chat;
