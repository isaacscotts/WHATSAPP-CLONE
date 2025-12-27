"use client"
import Avatar from "@/components/Avatar";
import useUserStore from "@/store";
import { onboardUser } from "@/utils/ApiRoutes";
import Image from "next/image";
import { useState,useEffect } from "react";
import { FaCamera } from "react-icons/fa";
import { useRouter } from "next/navigation";
const onboarding=()=>{
  const {userInfo,setUserInfo}=useUserStore()
    const [image,setImage]=useState("/default_avatar.png")
    const [username,setUserName]=useState("")
    const [about,setAbout]=useState("")
    const router=useRouter()
    
    console.log('data from zustand',userInfo)

    useEffect(()=>{
       const setUser=()=>{
        setImage(userInfo.profilePic)
        if(userInfo?.username){
          setUserName(userInfo?.username)
        }
        else{
   setUserName(`${userInfo?.firstName || ''} ${userInfo?.lastName || ''}`)
        }
     
        setAbout(`${userInfo.about || ''}`)
       }
       if(userInfo.id){
        setUser()
       }
    },[userInfo.id])

    const handleSubmit=async(e)=>{
      e.stopPropagation()
      try{
       const response=await fetch(onboardUser,{
        method:"post",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({about,username,clerkId:userInfo.clerkId,image})
       })
       const dataResponse=await response.json()
       if(dataResponse?.data){
        setUserInfo(dataResponse?.data)
        router.push('/')
        console.log("response from submit",dataResponse)
        return;
       }
       
      }
      catch(err){
        console.log(err)
      }
    }
  return (
    <div className="bg-[#202c33] h-screen flex flex-col items-center justify-center ">
      
      <div className="flex gap-4 items-center">
        <Image src="/whatsapp.gif" alt='whatsapp'width={300} height={300}/>
        <div><span className="text-5xl text-white">Whatsapp</span></div>
      </div>
         
          <div><h1 className="text-white text-2xl pb-4 items-center">Create your profile</h1></div>
        <div className="flex gap-3">
               <div className="flex flex-col items-center justify-center">
        
        <div>
            <div><span className="text-teal-400 text-xl">DisplayName</span></div>
            <input type="text" value={username} onChange={(e)=>setUserName(e.target.value)} className="bg-[#2a3942] p-1 rounded text-white  focus:outline-none"/>
        </div>

        <div>
            <div><span className="text-teal-400 text-xl">About</span></div>
            <input type="text" value={about} onChange={(e)=>setAbout(e.target.value)} className="bg-[#2a3942] p-1 rounded text-white  focus:outline-none"/>
        </div>
        <div className="flex items-center justify-center mt-3"> <button onClick={(e)=>handleSubmit(e)} className="text-white p-3 bg-black">Save</button></div>
       
      </div>

            <div>
                <Avatar type="xl" image={image} setImage={setImage}/>
                
            </div>

        </div>
   
    </div>
  )
}

export default onboarding;