"use client";
import { createContext, useContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { HOST } from "./utils/ApiRoutes";
import useUserStore from "./store";

const SocketContext = createContext(null);

export const SocketContextProvider = ({ children }) => {
  const {
    userInfo,
     setPeerSocketId,
    addMessager,
    setIncomingCall,
    setIsVideoCall,
    setIsCalling,
    setIsAudioCall,
    setCallPeerId

  } = useUserStore();

  const socketRef = useRef(null);

  useEffect(() => {
    if (!userInfo?.id) return;

    socketRef.current = io(HOST,{
      reconnection: true,
  reconnectionAttempts: 20,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  transports: ["websocket"],
    });

    // REGISTER USER
    socketRef.current.on("connect", () => {
  console.log("Connected:", socketRef.current.id);
  socketRef.current.emit("add-client", userInfo.id);
});
  //  socketRef.current.emit("add-client", userInfo.id);

    // ================= CHAT =================
    socketRef.current.on("msg-receive", (data) => {
      addMessager(data.message);
    });
  //incoming call
   socketRef.current.on("incoming-call",({from,type})=>{
    console.log("incoming call from",from)
     setPeerSocketId(from)
    setCallPeerId(from)
     setIncomingCall({from,type})
     
   })

   // call accepted
   socketRef.current.on('call-accepted',({from,type})=>{
    setIsCalling(false)
    setPeerSocketId(from)
    if(type==="video"){
setIsVideoCall(true)
    } else{
      setIsAudioCall(true)
    }
    
   })
   
// call rejected 
  socketRef.current.on("call-rejected",({from})=>{
    console.log("user ",from,"rejected your call")
    setIsVideoCall(false)
    setIsCalling(false)
  })

// call cancel
socketRef.current.on("call-cancel",({from,to})=>{
  
  setIncomingCall(null)

   
})
const ensureConnection = () => {
    if (!socketRef.current.connected) socketRef.current.connect();
  };
  window.addEventListener("online", ensureConnection);
  document.addEventListener("visibilitychange", ensureConnection);


   return () => {
  socketRef.current?.off();
  socketRef.current?.disconnect();
  window.removeEventListener("online", ensureConnection);
    document.removeEventListener("visibilitychange", ensureConnection);
};
  }, [userInfo]);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => {
  return useContext(SocketContext);
};
