'use client'
import { useEffect, useRef } from "react";
import { IoClose } from "react-icons/io5";
const CapturePhoto=({hide,setImage})=>{
    const videoRef=useRef(null)
    let stream;
useEffect(()=>{
    
    const startCamera=async()=>{
        stream=await navigator.mediaDevices.getUserMedia({audio:false,video:true})
        videoRef.current.srcObject=stream;
    }
    startCamera()
   
     return ()=>{
    
        if(stream){
            stream.getTracks().forEach(track=>track.stop())
        
     }
    }
    
},[])

const handleClose=(e)=>{
    e.stopPropagation()
    console.log("close1")
    hide(false)
    console.log("close2")
}

const CapturePhoto=()=>{
   const canvas=document.createElement('canvas')
   canvas.getContext('2d').drawImage(videoRef.current,0,0,300,150)
   setImage(canvas.toDataURL(canvas))
   hide(false)
}
   return (
    <div className="absolute top-[20%] left-[34%] bg-black w-[30%] h-[60%]">
        <div className="text-white flex justify-end " onClick={(e)=>handleClose(e)} ><IoClose className="cursor-pointer" size={35}/></div>

        <div>
            <video ref={videoRef} width={400} autoPlay />
        </div>

        <button onClick={()=>CapturePhoto()} className="bg-white  cursor-pointer border-8 border-teal-500 h-15 w-15 rounded-full"></button>
        </div>
   )
}

export default CapturePhoto;