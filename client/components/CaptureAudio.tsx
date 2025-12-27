"use client";

import { MdDelete } from "react-icons/md";
import { FaPause, FaMicrophone, FaPlay, FaStop } from "react-icons/fa";
import { IoSend } from "react-icons/io5";
import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";

const CaptureAudio = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(7);
  const [totalDuration, setTotalDuration] = useState(0);

  const audioCtxRef = useRef(null);
  const processorRef = useRef(null);
  const sourceRef = useRef(null);
  const streamRef = useRef(null);

  const pcmBuffersRef = useRef([]);
  const sampleRateRef = useRef(44100);

  const waveFormRef = useRef(null);
  const wave = useRef(null);

  const audioRef = useRef(null);
  const timerRef = useRef(null);

  /* ---------------- WaveSurfer ---------------- */
  useEffect(() => {
    wave.current = WaveSurfer.create({
      container: waveFormRef.current,
      waveColor: "red",
      progressColor: "blue",
      barWidth: 2,
      height: 30,
    }); 

    wave.current.on("finish", () => setIsPlaying(false));
    return () => wave.current.destroy();
  }, []);

  /* ---------------- Timer ---------------- */
  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setRecordingDuration((d) => d + 1);
    
      setTotalDuration((d) => d + 1);
    }, 1000);
  };

  
  
  /* ---------------- Start / Resume Recording ---------------- */
  const startRecording = async () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
      sampleRateRef.current = audioCtxRef.current.sampleRate;
    }

    streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
    sourceRef.current = audioCtxRef.current.createMediaStreamSource(streamRef.current);
    processorRef.current = audioCtxRef.current.createScriptProcessor(4096, 1, 1);

    processorRef.current.onaudioprocess = (e) => {
      if (!isPaused) {
        pcmBuffersRef.current.push(new Float32Array(e.inputBuffer.getChannelData(0)));
      }
    };

    sourceRef.current.connect(processorRef.current);
    processorRef.current.connect(audioCtxRef.current.destination);

    setIsRecording(true);
    setIsPaused(false);
    startTimer();
  };

  /* ---------------- Pause Recording ---------------- */
  const pauseRecording = () => {
    setIsPaused(true);
    stopTimer();
    setIsRecording(false)
    const wavBlob = buildWav();
    const url = URL.createObjectURL(wavBlob);
    audioRef.current = new Audio(url);
    wave.current.load(url);
  };

  /* ---------------- Stop Recording ---------------- */
  const stopRecording = () => {
    stopTimer();
    if (processorRef.current) processorRef.current.disconnect();
    if (sourceRef.current) sourceRef.current.disconnect();
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());

    const wavBlob = buildWav();
    const audioFile=new File([wavBlob],'recording.mp3')
    const url = URL.createObjectURL(wavBlob);
    audioRef.current = new Audio(url);
    wave.current.load(url);

    setIsRecording(false);
    setIsPaused(false);
  };

  const uploadAudio=async (audioFile)=>{
    try{
      const formData=new FormData()
      formData.append('audio',audioFile)
      
    }
    catch(err){
       console.log(err)
    }
  }

  /* ---------------- Playback ---------------- */
  const playRecording = () => {
    if (audioRef.current) {
      audioRef.current.play();
      wave.current.play();
      setIsPlaying(true);
    }
  };

  const pausePlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      wave.current.pause();
      setIsPlaying(false);
    }
  };

  /* ---------------- Build WAV ---------------- */
  const buildWav = () => {
    const buffers = pcmBuffersRef.current;
    const length = buffers.reduce((s, b) => s + b.length, 0);
    const pcm = new Float32Array(length);
    let offset = 0;
    buffers.forEach((b) => {
      pcm.set(b, offset);
      offset += b.length;
    });

    const buffer = new ArrayBuffer(44 + pcm.length * 2);
    const view = new DataView(buffer);

    writeString(view, 0, "RIFF");
    view.setUint32(4, 36 + pcm.length * 2, true);
    writeString(view, 8, "WAVE");
    writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRateRef.current, true);
    view.setUint32(28, sampleRateRef.current * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, "data");
    view.setUint32(40, pcm.length * 2, true);

    let idx = 44;
    pcm.forEach((s) => {
      view.setInt16(idx, Math.max(-1, Math.min(1, s)) * 0x7fff, true);
      idx += 2;
    });

    return new Blob([view], { type: "audio/wav" });
  };

  const writeString = (v, o, s) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));

  /* ---------------- Format Time ---------------- */
  const formatTime = (t) => {
    if (isNaN(t)) return "00:00";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="flex bg-pink-900 flex-col h-full w-full justify-center">
      <div className="flex justify-end">
        <div className="text-3xl">
          <MdDelete onClick={() => (pcmBuffersRef.current = [])} />
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
                {formatTime(isPlaying ? currentPlaybackTime : totalDuration)}
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
            <IoSend onClick={stopRecording} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaptureAudio;
