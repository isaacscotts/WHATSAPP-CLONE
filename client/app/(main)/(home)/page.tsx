"use client"
import Chat from "@/components/Chat";
import ChatList from "@/components/ChatList";
import Empty from "@/components/Empty";
import useUserStore from "@/store";
import { allMessages } from "@/utils/ApiRoutes";
import {UserButton,SignedIn} from "@clerk/nextjs"
import { currentUser } from "@clerk/nextjs/server";
import { useEffect } from "react";
const Home=()=>{
  const {currentChatUser,userInfo,messages,setMessages}=useUserStore()
  console.log(currentChatUser?.id)
  console.log('messagessss',messages)
  const fetchMessages=async ()=>{
    try{

     const data=await fetch(`${allMessages}/${userInfo?.id}/${currentChatUser?.id}`)
     const dataResponse=await data.json()
     setMessages(dataResponse?.data)
     console.log("data res",dataResponse)

    }
    catch(err){
      console.log(err)
    }
  }

  useEffect(()=>{
    if(currentChatUser?.id){
       fetchMessages()
    }
  
  },[currentChatUser])

  
  return (
    <div className="flex">
     <ChatList/>
     {currentChatUser?<Chat/> : <Empty/>}

    </div>
  )
}

export default Home;