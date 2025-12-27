"use client"
import { useSocketContext } from "@/SocketContext"
import useUserStore from "@/store"
import { addVoiceMessage } from "@/utils/ApiRoutes"
import { useRef, useState ,useEffect} from "react"
import { FaMicrophone, FaPause, FaPlay, FaStop } from "react-icons/fa"
import { IoSend } from "react-icons/io5"
import { MdDelete } from "react-icons/md"
import WaveSurfer from "wavesurfer.js"




const Capture=({start,hide})=>{
    const {currentChatUser,userInfo,addMessager}=useUserStore()
     const socket=useSocketContext()
    const audioCtxRef=useRef(null)
    const sampleRateRef=useRef(44100)
    const streamRef=useRef(null)
    const recordedSamplesRef=useRef(0)
    const sourceRef=useRef(null)
    const isPausedRef=useRef(null)
    const processorRef=useRef(null)
    const audioRef=useRef(null)
    const [isPaused,setIsPaused]=useState(false)
    const [isRecording,setIsRecording]=useState(false)
    const pcmBuffersRef=useRef([])
    const timerRef=useRef(null)
    const [currentPlaybackTime,setCurrentPlaybackTime]=useState(0)
    const waveFormRef=useRef(null)
    const [isPlaying,setIsPlaying]=useState(false)
    const [ActualDuration,setActualDuration]=useState(0)
    const wave=useRef(null)
    const [recordingDuration,setRecordingDuration]=useState(0)
    const [totalDuration,setTotalDuration]=useState(0)
  
    useEffect(()=>{
        wave.current=WaveSurfer.create({
           container:waveFormRef.current,
           waveColor:"red",
           progressColor:"blue",
           barWidth:2,
           height:30
        })
        wave.current.on("audioprocess",()=>{
            setCurrentPlaybackTime(wave.current.getCurrentTime())
        })
        wave.current.on("interaction",()=>{
            setCurrentPlaybackTime(wave.current.getCurrentTime())
        })
        wave.current.on("finish",()=>setIsPlaying(false))
         return ()=>wave.current.destroy()
    },[])
    useEffect(()=>{
       if(start){
        if(wave.current){
            startRecording()
        }
        
       }
    },[])
    const playRecording=()=>{
        if(audioRef.current){
            //audioRef.current.play()
            wave.current.play()
            setIsPlaying(true)
          
        }
    }
    const pausePlayback=()=>{
        if(audioRef.current){
            //audioRef.current.pause()
            wave.current.pause()
            setIsPlaying(false)
        }
    }
    const startTimer=()=>{
        timerRef.current=setInterval(()=>{
            setRecordingDuration(prev=>prev+1)
            setTotalDuration(prev=>prev+1)
        },1000)
    }

    
    const stopTimer=()=>{
        clearInterval(timerRef.current);
        timerRef.current=null
    }

    
    /*const startRecording=async ()=>{
      
      isPausedRef.current=false
        if(!audioCtxRef.current){
           audioCtxRef.current=new AudioContext()
           sampleRateRef.current=audioCtxRef.current.sampleRate;

        }
        if (audioCtxRef.current.state === 'suspended') {
        await audioCtxRef.current.resume();
    }
        streamRef.current=await navigator.mediaDevices.getUserMedia({audio:true});
        sourceRef.current=audioCtxRef.current.createMediaStreamSource(streamRef.current)
        processorRef.current=audioCtxRef.current.createScriptProcessor(4096,1,1)
        processorRef.current.onaudioprocess=(e)=>{
            if(isPausedRef.current) {
              console.log("not recording")
              return;
            }
                const input = e.inputBuffer.getChannelData(0)

              pcmBuffersRef.current.push(new Float32Array(input))
              recordedSamplesRef.current += input.length
            console.log("wefera iam  recording")
        }
        sourceRef.current.connect(processorRef.current)
        processorRef.current.connect(audioCtxRef.current.destination)
        setIsRecording(true)
        setIsPaused(false)
        startTimer()

    }
        */
       const startRecording = async () => {
  isPausedRef.current = false

  // 🔹 Create audio graph ONLY ONCE
  if (!audioCtxRef.current) {
    audioCtxRef.current = new AudioContext()
    sampleRateRef.current = audioCtxRef.current.sampleRate

    streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true })
    sourceRef.current =
      audioCtxRef.current.createMediaStreamSource(streamRef.current)

    processorRef.current =
      audioCtxRef.current.createScriptProcessor(4096, 1, 1)

    processorRef.current.onaudioprocess = (e) => {
      if (isPausedRef.current) return

      const input = e.inputBuffer.getChannelData(0)
      pcmBuffersRef.current.push(new Float32Array(input))
     // recordedSamplesRef.current += input.length
    }

    sourceRef.current.connect(processorRef.current)
    processorRef.current.connect(audioCtxRef.current.destination)
  }

  // 🔹 Resume instead of recreate
  if (audioCtxRef.current.state === "suspended") {
    await audioCtxRef.current.resume()
  }

  setIsRecording(true)
  setIsPaused(false)
  startTimer()
}

const pauseRecording=async ()=>{
      isPausedRef.current=true
    setIsPaused(true)
     setIsRecording(false)
     
     if (audioCtxRef.current) {
      audioCtxRef.current.suspend()
      
    }
    stopTimer()
    const totalSamples = pcmBuffersRef.current.reduce((acc, buf) => acc + buf.length, 0);
    const actualDuration = totalSamples / sampleRateRef.current;
    setActualDuration(actualDuration)
     const waveblob=buildWav()
     const url=URL.createObjectURL(waveblob)
     audioRef.current=new Audio(url)
     wave.current.load(url)
     

}

const stopRecording=async()=>{
   stopTimer()
   if(streamRef.current)  streamRef.current.getTracks().forEach((t)=>t.stop())
      
   if(processorRef.current) processorRef.current.disconnect()
    if(sourceRef.current)   sourceRef.current.disconnect()
    
          const waveBlob=buildWav()
      if (!waveBlob || waveBlob.size < 100) { // Tiny blobs are usually header-only/empty
            console.error("Audio blob is too small or empty");
            return;
        }
          const audioUrl=new File([waveBlob],'recording.wav',{type:"audio/wav"})
           await uploadRecording(audioUrl)
          const url=URL.createObjectURL(waveBlob)
          audioRef.current=new Audio(url)
          wave.current.load(url);
          setIsRecording(false)
         setIsPaused(false)
        // await uploadRecording(audioUrl)
         pcmBuffersRef.current=[]
         setRecordingDuration(0)
         hide()
    }
const uploadRecording=async(audioFile)=>{
    try{
        const formData=new FormData()
        formData.append("audio",audioFile)

        const response=await fetch(`${addVoiceMessage}/${userInfo?.id}/${currentChatUser?.id}`,{
            method:"post",
            body:formData
        })
        const responseData=await response.json()
        if(responseData?.newMessage){
          addMessager(responseData?.newMessage)
          socket.emit("msg-send",{
        from:userInfo?.id,
        to:currentChatUser?.id,
        message:responseData?.newMessage
      })
        }
        console.log("voice message addred",responseData)
        

      
    }
    catch(error){
        console.log(error)
    }
}

    const buildWav=()=>{
        const buffers=pcmBuffersRef.current
        const length=buffers.reduce((s,b)=>s+b.length,0)
        const pcm=new Float32Array(length);
        
        let offset=0;
        buffers.forEach((b)=>{
            pcm.set(b,offset);
            offset +=b.length;
        })
       // const pcm = pcm1.slice(0, recordedSamplesRef.current)
            const numChannels = 1;
    const bitsPerSample =16;
    const byteRate = sampleRateRef.current *( numChannels *( bitsPerSample / 8));
    const blockAlign = numChannels * (bitsPerSample / 8);
    



        const buffer=new ArrayBuffer(44+pcm.length*2)
        const view=new DataView(buffer);
        //riff chunk id   0-4  4 bytes
        writeString(view,0,"RIFF");
        // riff chung size 4-8 4 bytes
        view.setUint32(4,36+pcm.length*2,true);
        // format 8-12 4 bytes
        writeString(view,8,"WAVE")
        //fmt chunk id 12-16
        writeString(view,12,"fmt ")
        //fmt chunk size 16-20
        view.setUint32(16,16,true)
        // audio format 20-22
        view.setUint16(20,1,true)
        //number of channels 22-24
        view.setUint16(22,1,true)
        //sample rate 24-28
        view.setUint32(24,sampleRateRef.current,true)
        //byte rate 28-32
        view.setUint32(28,byteRate,true)
        //block align 32-34
        view.setUint16(32,blockAlign,true)
        //bitts per sample 34-36
        view.setUint16(34,16,true)
        // data chunk 36-40
        writeString(view,36,"data")
        // data size 40-44
        view.setUint32(40,pcm.length * 2,true)

        let offsetA=44;
        for(let i=0;i<pcm.length;i++,offsetA +=2){
            // audio data should be between -1.0 and 1.0
            let s=Math.max(-1,Math.min(1,pcm[i]));
            view.setInt16(offsetA,s<0?s*0x8000:s*0x7FFF,true)
        }
       return new Blob([view.buffer],{type:"audio/wav"})

    }

    const writeString=(view,offset,string)=>{
       for(let i=0;i<string.length;i++){
        view.setUint8(offset + i,string.charCodeAt(i))
       }
    }

    const formatTime=(time)=>{
         if(isNaN(time)) return "00:00";
         const m=Math.floor(time/60)
         const s=Math.floor(time%60)
         return `${m.toString().padStart(2,"0")}:${s.toString().padStart(2,'0')}`
    }
   return (
       <div className="flex bg-pink-900 flex-col h-full w-full justify-center">
         <div className="flex justify-end">
           <div className="text-3xl">
             <MdDelete onClick={() =>{
                pcmBuffersRef.current=[]
                setIsPlaying(false)
                if(audioRef.current){
                    audioRef.current.pause()
                    audioRef.current.src=''
                }
                if(wave.current){
                    wave.current.stop()
                }
                if(streamRef.current){
                    streamRef.current.getTracks().forEach((t)=>t.stop())
                }
                hide()
             }} />
           </div>
   
           <div className="bg-black rounded-3xl w-[30%] px-3 flex items-center justify-between">
             <div className="flex items-center w-full pl-2">
             {isRecording && isPaused && (<span>{formatTime(recordingDuration)}</span>)}
               {isRecording && !isPaused ? (
                 <span className="text-red-600">Recording {formatTime(recordingDuration)}</span>
               ) : !isPlaying ? (
                 <FaPlay onClick={playRecording} className="text-green-900 cursor-pointer" />
               ) : (
                 <FaStop onClick={pausePlayback} className="text-red-900 cursor-pointer" />
               )}
   
               <div className="flex-1 pl-2" ref={waveFormRef} hidden={isRecording && !isPaused} />
   
               {!isRecording && (
                 <span className="pl-2 text-white">
                   {formatTime(isPlaying ? currentPlaybackTime:ActualDuration)}
                 </span>
               )}
             </div>
   
             <div className="text-red-600">
               {!isRecording ? (
                 <FaMicrophone onClick={startRecording} />
               ) : isPaused ? (
                 <FaMicrophone onClick={startRecording} />
               ) : (
                 <FaPause onClick={pauseRecording} />
               )}
             </div>
   
             <div className="text-white">
               <IoSend onClick={()=>stopRecording()} />
             </div>
           </div>
         </div>
       </div>
     );

}

export default Capture;

