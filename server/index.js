import express from "express";
import cors from "cors";
import AuthRoutes from "./routes/AuthRoutes.js";
import MessageRoutes from "./routes/MessageRoutes.js";
import { Server } from "socket.io";
import { db } from "./utils/PrismaClient.js";

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
// "https://isaac-tsups.vercel.app",
const io = new Server(server, {
  
  cors: {
    origin:"https://isaac-tsups.vercel.app",
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
  socket.on("msg-send", async(data) => {
    console.log("sennnnnn",data)
        await db.messages.update({
        where:{id:data.id},
        data:{messageStatus:"delivered"}
      })
    const sendUserSocket = onlineUsers.get(data.receiverId);

    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-receive",data);
    
  // tellling user it is delivered
      socket.emit("msg-delivered",{
        messageId:data.id
      })
       
    
    }
  })

  //msg read
  socket.on("msg-read",async ({from,to,messageIds})=>{
        console.log('msg kkks')
       if (!messageIds?.length) return;
   
            await db.messages.updateMany({
        where:{id:{
          in:messageIds
        }},
        data:{messageStatus:"read"}
      })
    const sendUserSocket=onlineUsers.get(from)
    if(sendUserSocket){
      console.log('read ignited')
      socket.to(sendUserSocket).emit("msg-read",{
        messageIds,
      })
    }




  
    

  })

  //webrtc ice
  socket.on("webrtc-ice",({candidate,to})=>{
    const sendUserSocket=to
    if(sendUserSocket){
      socket.to(sendUserSocket).emit("webrtc-ice",{candidate})
    }
  })

  // web rtc offer 
  socket.on("webrtc-offer",({to,from,offer})=>{
        const sendUserSocket=to
        if(sendUserSocket){
          console.log("web rtc offer from",from)
          socket.to(sendUserSocket).emit("webrtc-offer",{offer})
        }
  })

  // web rtc answer 
  socket.on('webrtc-answer',({answer,to,from})=>{
    const sendUserSocket=to
    if(sendUserSocket){
     console.log("web rtc anwser from",from)
      socket.to(sendUserSocket).emit('webrtc-answer',{answer})
    }
  })

  // calling user
  socket.on("call-user",({to,from,type})=>{
    const sendUserSocket=onlineUsers.get(to)
    if(sendUserSocket){
      console.log(from,"is calling ",to,type)
      socket.to(sendUserSocket).emit('incoming-call',{from,type})
    }
  })

 // call accepted
 socket.on("call-accepted",({from,to,type})=>{
  console.log("call accepting",to)
    const sendUserSocket=to
    if(sendUserSocket){
      console.log("call accepted from ",from,'to',to)
      socket.to(sendUserSocket).emit("call-accepted",{from,to,type})
    }
    
 })

 // end call
   socket.on("end-call",({to})=>{
     const sendUserSocket=to
      if(sendUserSocket){
        socket.to(sendUserSocket).emit("call-ended")
      }
   })

   //call rejected
   socket.on("call-rejected",({to,from})=>{
    const sendUserSocket=to
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
