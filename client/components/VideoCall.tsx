"use client"

import { useSocketContext } from "@/SocketContext";
import useUserStore from "@/store";
import { useEffect, useRef } from "react";

const VideoCall=({isCaller})=>{
  const {currentChatUser,userInfo,incomingCall,endCall}=useUserStore()
  const localStreamRef=useRef(null)
  const remoteStreamRef=useRef(null)
  const pcRef=useRef(null)
  const pendingCandidates=useRef([])
  const makingOffer=useRef(null)
  const socket=useSocketContext()
     
  const cleanupCall=()=>{
    const stream=localStreamRef.current.srcObject;
    stream.getTracks().forEach((t)=>t.stop())

    if(localStreamRef.current) localStreamRef.current.srcObject=null;
    if(remoteStreamRef.current) remoteStreamRef.current.srcObject=null
    if(!socket || !currentChatUser) return;
     
    socket.emit("end-call",{to:incomingCall || currentChatUser?.id})
    
  }
  
  useEffect(()=>{
    if(!socket || !currentChatUser) return
    //resetting
   
    if(localStreamRef.current) localStreamRef.current.srcObject=null
    if(remoteStreamRef.current) remoteStreamRef.current.srcObject=null

    //create peer connection
    const pc=new RTCPeerConnection({
      iceServers:[
        {urls:"stun:stun.l.google.com:19302"}
      ]
    })
     pcRef.current=pc
/// setting remote track
     pc.ontrack=(e)=>{
       console.log('tracks added')
       if(remoteStreamRef.current && remoteStreamRef.current.srcObject !==e.streams[0]){
        remoteStreamRef.current.srcObject=e.streams[0]
       }
     }
     //on ice candidate
     pc.onicecandidate=(e)=>{
          if(e.candidate){
               socket.emit("webrtc-ice",{
          to:currentChatUser?.id,
          candidate:e.candidate,
          from:userInfo?.id
         })
          }
        
     }
//  only caller create offer
     pc.onnegotiationneeded=async()=>{
       if(!isCaller || makingOffer.current) return ;
         try{
            makingOffer.current=true
            const offer=await pc.createOffer()
      await  pc.setLocalDescription(offer)

       socket.emit("webrtc-offer",{
         to:currentChatUser?.id,
         offer,
         from:userInfo?.id
       })
         }
         catch(err){
          console.log(err)
         }
         finally{
            makingOffer.current=false
         }
     }
     /// start media
     const startMedia=async()=>{
       const stream=await navigator.mediaDevices.getUserMedia({audio:true,video:true})
       if(localStreamRef.current){
        localStreamRef.current.srcObject=stream
       }
       stream.getTracks().forEach((t)=>pc.addTrack(t,stream))
     }
     startMedia()
// handle offer
const handleOffer=async({offer})=>{
     if(pc.signalingState!=="stable") return;
     await pc.setRemoteDescription(offer)
     for(let i=0;i<pendingCandidates.current.length;i++){
        pc.addIceCandidate(pendingCandidates.current[i])
     }
     pendingCandidates.current=[]
     const answer=await pc.createAnswer()
     await pc.setLocalDescription(answer)

     socket.emit("webrtc-answer",{
      to:incomingCall,
      from:userInfo?.id,
      answer,
     })
}

//handle webrtc answer
const handleAnswer=async({answer})=>{
   if(!answer) return;
   await pc.setRemoteDescription(answer)
   
   for(let i=0;i<pendingCandidates.current.length;i++){
     pc.addIceCandidate(pendingCandidates.current[i])
   }

    pendingCandidates.current=[]


}
//handle ice candidates
 const handleIceCandidate=async({candidate})=>{
   if(pc.remoteDescription){
      await pc.addIceCandidate(candidate)

   }
   else{
    pendingCandidates.current.push(candidate)
   }
 }



 
 socket.on("webrtc-ice",handleIceCandidate)
 socket.on("webrtc-offer",handleOffer)
  socket.on("webrtc-answer",handleAnswer)
 
    return ()=>{
      socket.off("webrtc-ice",handleIceCandidate)
 socket.off("webrtc-offer",handleOffer)
socket.off("webrtc-answer",handleAnswer)
pc.close()
    }
  },[socket,userInfo,currentChatUser,isCaller])

  useEffect(()=>{
    if(!socket)  return;
    const handleRemoteEnd=()=>{
       cleanupCall()
       endCall()
    }
    socket.on("call-ended",handleRemoteEnd)

    return()=>{
      socket.off("call-ended",handleRemoteEnd)
    }
  },[])
    return (
      <div className="fixed inset-0 bg-black z-50 ">
        <div className="flex justify-end right-0 absolute z-2 pt-2 pr-2"><span onClick={()=>{
           cleanupCall()
          endCall()
        }} className="text-white cursor-pointer bg-red-500 p-3 ">END</span></div>
        <div className="w-full h-full">
          <video ref={remoteStreamRef} autoPlay className="w-full object-cover h-full"/>
        </div>
         <div className=" absolute w-60 h-60  bottom-1 right-1">
             <video ref={localStreamRef} autoPlay className="object-cover w-full h-full"/>
         </div>
      </div>
    )
}

export default VideoCall;