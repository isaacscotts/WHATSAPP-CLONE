"use client"

import { FaPause } from "react-icons/fa6";
import { FaPlay } from "react-icons/fa6";
import { useEffect,useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import Avatar from "./Avatar";
import useUserStore from "@/store";
import { CiWavePulse1 } from "react-icons/ci";
import { HOST } from "@/utils/ApiRoutes";
const VoiceMessage=({message})=>{
  const waveFormRef=useRef(null)
  const wave=useRef(null)
  const [isPlaying,setIsPlaying]=useState(false)
  const {currentChatUser,userInfo,playingMessageId,setPlayingMessageId}=useUserStore()
  const [currentPlaybackTime,setCurrentPlaybackTime]=useState(0)
  const [totalDuration,setTotalDuration]=useState(0)
  const audioRef=useRef(null)
 console.log("current",currentChatUser,"user",userInfo)
  console.log("this is the message boi",message)
 const audio=new Audio(`${HOST}/${message?.message}`)
 const currentMessageId=message?.id
  const audioUrl=message?.isLocal?message?.message:`${HOST}/${message?.message}`
const play=()=>{
 // audio.play()
  wave.current.play()
  setIsPlaying(true)
  setPlayingMessageId(currentMessageId)
}
useEffect(()=>{
  if(playingMessageId !==null && playingMessageId!==currentMessageId && isPlaying){
    if(wave.current){
      wave.current.pause()
      setIsPlaying(false)
    }
  }
},[playingMessageId])
  const pause=()=>{
    if(wave.current){
      wave.current.pause()
      setIsPlaying(false)
    }
  }
  useEffect(() => {
  if (!waveFormRef.current || !audioUrl) return

  const ws = WaveSurfer.create({
    container: waveFormRef.current,
    waveColor: "red",
    progressColor: "blue",
    barWidth: 2,
    height: 20,
  })

  wave.current = ws

  ws.on("finish", () => {
    setIsPlaying(false)
  })

  ws.on("audioprocess", () => {
    setCurrentPlaybackTime(ws.getCurrentTime())
  })

  ws.on("ready", () => {
    setTotalDuration(ws.getDuration())
  })

  ws.load(audioUrl)

  return () => {
    // IMPORTANT: cleanup the SAME instance
    ws.stop()
    ws.unAll()
    ws.destroy()
  }
}, [audioUrl])

  const formatTime=(time)=>{
    if(isNaN(time)) return "00:00"

    const minutes=Math.floor(time/60)
    const seconds=Math.floor(time%60)

    return `${minutes.toString().padStart(2,"0")}:${seconds.toString().padStart(2,"0")}`
  }
  return (
    <div className="flex items-center" >
      <Avatar type={"sm"} image={message?.senderId!==userInfo?.id?currentChatUser?.profilePic:userInfo?.profilePic}/>
      <div className="pl-3 flex w-full">
        {isPlaying?<FaPause onClick={()=>pause()}/>:<FaPlay onClick={()=>play()}/>}
        
          <div className="flex flex-col">
            <div className="flex-1 w-40 pl-2" ref={waveFormRef}></div>
            <div>
              {isPlaying?formatTime(currentPlaybackTime):formatTime(totalDuration)}
              </div>
          </div>
          
      </div>
        
    </div>
  )
}

export default  VoiceMessage;