"use client"

import { useSocketContext } from "@/SocketContext";
import useUserStore from "@/store";
import { useEffect, useRef } from "react";

const VideoCall=({isCaller})=>{
  const {currentChatUser,peerSocketId,userInfo,callPeerId,incomingCall,endCall,setIsScreenShare,isScreenShare}=useUserStore()
  const localStreamRef=useRef(null)
  const remoteStreamRef=useRef(null)
  const screenStreamRef=useRef(null)
  const cameraStreamRef=useRef(null)
  const pcRef=useRef(null)
  const pendingCandidates=useRef([])
  const makingOffer=useRef(null)
  const socket=useSocketContext()
  

  
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
    socket.emit("end-call", { to: peerSocketId || currentChatUser?.id });
  }
};



  const startScreenShare=async ()=>{
    try{
       const screenStream=await navigator.mediaDevices.getDisplayMedia({video:true,audio:false})
       screenStreamRef.current=screenStream;

         const screenTrack=screenStream.getVideoTracks()[0]

         const sender=pcRef.current.getSenders()
         .find((s)=>(s.track && s.track.kind==="video"))

         if(sender){
          await sender.replaceTrack(screenTrack)
         }

         localStreamRef.current.srcObject=screenStream;

         screenTrack.onended=()=>stopScreenShare()

         

    }
    catch(err){
      console.log("screen share failed ",error)
    }
  }
  
useEffect(()=>{
  if(screenStreamRef?.current){
    console.log("screen ref present",screenStreamRef?.current)
    screenStreamRef.current=null
  }

  else{
    console.log("screen ref absent",screenStreamRef?.current)
  }
     
},[isScreenShare,screenStreamRef?.current])
  const stopScreenShare=async()=>{
     if(!screenStreamRef.current) return;
          
      screenStreamRef.current.getTracks().forEach(t=>t.stop())
      screenStreamRef.current=null
   // localStreamRef.current.srcObject=await navigator.mediaDevices.getUserMedia({video:true,audio:true})
    
    const cameraTrack=cameraStreamRef.current.getVideoTracks()[0]

    const sender=pcRef.current.getSenders()
    .find(s=>s.track && s.track.kind==="video")

    if(sender){
      await sender.replaceTrack(cameraTrack)
    }

    localStreamRef.current.srcObject=cameraStreamRef.current
    setIsScreenShare(false)
 
  }   


  

  useEffect(()=>{
const handleUnload=()=>{
    socket.emit("end-call",{to:peerSocketId})
  }
  window.addEventListener('beforeunload',handleUnload)

  return()=>{
    window.addEventListener("beforeunload",handleUnload)
  }
  },[])
  useEffect(()=>{
    if(!socket || !currentChatUser) return
    //resetting
   
    if(localStreamRef.current) localStreamRef.current.srcObject=null
    if(remoteStreamRef.current) remoteStreamRef.current.srcObject=null
    if(screenStreamRef.current) screenStreamRef.current.srcObject=null





    //create peer connection
    const pc=new RTCPeerConnection({
      iceServers:[
        {urls:"stun:stun.l.google.com:19302"}
      ]
    })
     pcRef.current=pc
     
      let disconnectTimeout=null;

      pc.oniceconnectionstatechange=()=>{
        console.log("Ice state",pc.iceConnectionState)
      
         if(pc.iceConnectionState==="disconnected"){
          disconnectTimeout=setTimeout(()=>{
             if(pc.iceConnectionState !=="connected"  && 
              pc.iceConnectionState !=="checking"
             ){
              endCall()
             }
          },8000)
         }

         if(pc.iceConnectionState==="connected"){
          clearTimeout(disconnectTimeout)
         }
      }
   


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
          to:peerSocketId,
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
         to:peerSocketId,
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
      to:peerSocketId,
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
      clearTimeout(disconnectTimeout)
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
        {!isScreenShare?
        (<div className="flex justify-start left-0 absolute z-2 pt-2 pl-2"><span onClick={()=>{
           startScreenShare()
           setIsScreenShare(true)
        }} className="text-white cursor-pointer bg-green-500 p-3 ">Share Screen</span></div>)
        :
        (<div className="flex justify-start left-0 absolute z-2 pt-2 pl-2"><span onClick={()=>{
           stopScreenShare()
           
        }} className="text-white cursor-pointer bg-green-500 p-3 ">Stop screen Share</span></div>)
      }
        
         
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