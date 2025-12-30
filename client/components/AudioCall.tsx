"use client"

import { useSocketContext } from "@/SocketContext";
import useUserStore from "@/store";
import { useEffect, useRef } from "react";

const AudioCall=({isCaller})=>{
  const {currentChatUser,userInfo,incomingCall,endCall,setIsScreenShare,isScreenShare}=useUserStore()
  const localStreamRef=useRef(null)
  const remoteStreamRef=useRef(null)
  const screenStreamRef=useRef(null)
  const cameraStreamRef=useRef(null)
  const pcRef=useRef(null)
  const pendingCandidates=useRef([])
  const makingOffer=useRef(null)
  const socket=useSocketContext()
  
console.log("caller",isCaller)
  
  const cleanupCall = () => {
  setIsScreenShare(false);

  // local camera cleanup
  if (localStreamRef.current?.srcObject) {
    localStreamRef.current.srcObject.getTracks().forEach((t) => t.stop());
    localStreamRef.current.srcObject = null;
  }

  if(cameraStreamRef.current){
     cameraStreamRef.current.getTracks().forEach((t)=>t.stop())
     cameraStreamRef.current=null
  }

  // screen stream cleanup
  if (screenStreamRef.current) {
    screenStreamRef.current.getTracks().forEach((t) => t.stop());
    screenStreamRef.current = null;
  }

  // remote stream cleanup
  if (remoteStreamRef.current?.srcObject) {
    remoteStreamRef.current.srcObject.getTracks().forEach((t) => t.stop());
    remoteStreamRef.current.srcObject = null;
  }

  // Peer connection cleanup
  if (pcRef.current) {
    pcRef.current.getSenders().forEach(s => s.track?.stop());
    pcRef.current.close();
    pcRef.current = null;
  }

  if (socket && currentChatUser) {
    socket.emit("end-call", { to: incomingCall?.from || currentChatUser?.id });
  }
};



  
  

 
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
       const stream=await navigator.mediaDevices.getUserMedia({audio:{
        echoCancellation:true,
        noiseSuppression: true,
    autoGainControl: true,
       },video:false})
       cameraStreamRef.current=stream;
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
      to:incomingCall?.from,
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
 
          <div className="text-white flex flex-col justify-center items-center h-full">
   <p>🎧 Audio Call In Progress...</p>
  <span onClick={()=>{
           cleanupCall()
           
          endCall()
        }} className="text-white cursor-pointer bg-red-500 p-3 ">END</span>
</div>

          
         <div className="flex justify-end right-0 absolute z-2 pt-2 pr-2"></div>
       
         <audio ref={remoteStreamRef} autoPlay />

      </div>
    )
}

export default AudioCall;