import express from "express";
import cors from "cors";
import AuthRoutes from "./routes/AuthRoutes.js";
import MessageRoutes from "./routes/MessageRoutes.js";
import { Server } from "socket.io";

const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());
app.use("/uploads/images", express.static("uploads/images"));
app.use("/uploads/recordings", express.static("uploads/recordings"));
app.use("/api/auth", AuthRoutes);
app.use("/api/messages", MessageRoutes);

const server = app.listen(PORT, () => {
  console.log(`server is running at port ${PORT}`);
});

global.onlineUsers = new Map();

const io = new Server(server, {
  cors: {
    origin: "https://isaac-tsups.vercel.app",
  },
});

io.on("connection", (socket) => {
  console.log("🔌 client connected:", socket.id);

  // REGISTER USER
  socket.on("add-client", (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log("👤 user registered:", userId, "→", socket.id);
  });

  // ===================== CHAT =====================
  socket.on("msg-send", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);

    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-receive", {
        to: data.to,
        from: data.from,
        message: data.message,
      });
    }
  })

  //webrtc ice
  socket.on("webrtc-ice",({candidate,to})=>{
    const sendUserSocket=onlineUsers.get(to)
    if(sendUserSocket){
      socket.to(sendUserSocket).emit("webrtc-ice",{candidate})
    }
  })

  // web rtc offer 
  socket.on("webrtc-offer",({to,from,offer})=>{
        const sendUserSocket=onlineUsers.get(to)
        if(sendUserSocket){
          console.log("web rtc offer from",from)
          socket.to(sendUserSocket).emit("webrtc-offer",{offer})
        }
  })

  // web rtc answer 
  socket.on('webrtc-answer',({answer,to,from})=>{
    const sendUserSocket=onlineUsers.get(to)
    if(sendUserSocket){
     console.log("web rtc anwser from",from)
      socket.to(sendUserSocket).emit('webrtc-answer',{answer})
    }
  })

  // calling user
  socket.on("call-user",({to,from})=>{
    const sendUserSocket=onlineUsers.get(to)
    if(sendUserSocket){
      console.log(from,"is calling ",to)
      socket.to(sendUserSocket).emit('incoming-call',{from})
    }
  })

 // call accepted
 socket.on("call-accepted",({from,to})=>{
  console.log("call accepting")
    const sendUserSocket=onlineUsers.get(to)
    if(sendUserSocket){
      console.log("call accepted from ",from,'to',to)
      socket.to(sendUserSocket).emit("call-accepted",{from,to})
    }
    
 })

 // end call
   socket.on("end-call",({to})=>{
     const sendUserSocket=onlineUsers.get(to)
      if(sendUserSocket){
        socket.to(sendUserSocket).emit("call-ended")
      }
   })

   //call rejected
   socket.on("call-rejected",({to,from})=>{
    const sendUserSocket=onlineUsers.get(to)
    if(sendUserSocket){
      console.log('call rejected by ',from,"for",to)
      socket.to(sendUserSocket).emit('call-rejected',{from,to})
    }
   })

   socket.on("call-cancel",({from,to})=>{
        const sendUserSocket=onlineUsers.get(to)
      if(sendUserSocket){
        console.log("user ",from,"cancalled the call"," for",to)
        socket.to(sendUserSocket).emit("call-cancel",{from,to})
      }
   })

    // CLEANUP ON DISCONNECT
  socket.on("disconnect", () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    console.log("❌ client disconnected:", socket.id);
  });

});
