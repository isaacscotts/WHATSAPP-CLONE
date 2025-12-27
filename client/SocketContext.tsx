"use client";
import { createContext, useContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { HOST } from "./utils/ApiRoutes";
import useUserStore from "./store";

const SocketContext = createContext(null);

export const SocketContextProvider = ({ children }) => {
  const {
    userInfo,
    addMessager,
    setIncomingCall,
    setIsVideoCall,
    setIsCalling

  } = useUserStore();

  const socketRef = useRef(null);

  useEffect(() => {
    if (!userInfo?.id) return;

    socketRef.current = io(HOST);

    // REGISTER USER
    socketRef.current.emit("add-client", userInfo.id);

    // ================= CHAT =================
    socketRef.current.on("msg-receive", (data) => {
      addMessager(data.message);
    });
  //incoming call
   socketRef.current.on("incoming-call",({from})=>{
    console.log("incoming call from",from)
     setIncomingCall(from)
     
   })

   // call accepted
   socketRef.current.on('call-accepted',({from})=>{
    setIsCalling(false)
    setIsVideoCall(true)
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

   return () => {
  socketRef.current?.off();
  socketRef.current?.disconnect();
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
