"use client"
import Chat from "@/components/Chat";
import ChatList from "@/components/ChatList";
import Empty from "@/components/Empty";
import useUserStore from "@/store";
import { allMessages } from "@/utils/ApiRoutes";
import {useRouter} from "next/navigation"
import {UserButton,SignedIn,useUser} from "@clerk/nextjs"
import { currentUser } from "@clerk/nextjs/server";
import { useEffect } from "react";
const Home=()=>{
  const {user,isLoaded}=useUser()
  const router=useRouter()
  const {currentChatUser,userInfo,messages,setMessages}=useUserStore()
  console.log(currentChatUser?.id)
  console.log('messagessss',messages)
  useEffect(()=>{
  if(!user){
    return router.push("/login")
  }
    
  },[user])
 if(!isLoaded){
  return null
 }
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