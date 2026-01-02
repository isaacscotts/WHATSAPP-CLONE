"use client"
import { useEffect } from "react";
import { FcGoogle } from "react-icons/fc";
import {SignInButton, useUser} from "@clerk/nextjs"
import Image from 'next/image';
import { checkUser } from "@/utils/ApiRoutes";
import {redirect, useRouter} from "next/navigation";
import useUserStore from "@/store";
import { resolve } from "path";
const Login=()=>{
    const {isLoaded,isSignedIn,user}=useUser()
    const {setUserInfo,setMessages,setCurrentChatUser}=useUserStore();
    const router=useRouter()
 useEffect(() => {
  if (!isLoaded) return
  if(!isSignedIn) return
  if (!user?.id) return

  
  let cancelled = false

  const checkUSER = async () => {
    let attempts = 0
    const maxAttempts = 5

    while (attempts < maxAttempts && !cancelled) {
      try {
        const response = await fetch(checkUser, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ clerkId: user.id }),
        })

        const dataResponse = await response.json()
         
        if (dataResponse?.data) {
          
          if (!dataResponse.data.onboarding) {
            setCurrentChatUser(null)
            setUserInfo(dataResponse.data)
            router.push("/onboarding")
            return
          }

          setUserInfo(dataResponse.data)
          
          router.push("/")
          return
        }

        attempts++
        console.log(`User not found, retrying (${attempts})`)
        await new Promise((r) => setTimeout(r, 2000))
      } catch (err) {
        console.error(err)
        return
      }
    }

    console.error("Failed to get user after retries")
  }

  checkUSER()

  return () => {
    cancelled = true
  }
}, [isLoaded, isSignedIn, user?.id])
 
    return (
        <div className='flex justify-center h-screen flex-col bg-[#202c33] items-center'>
            <div className='flex gap-2 items-center'>
                <Image src="/whatsapp.gif" alt='isaac tsup' width={300} height={300}/>
           <div><span className='text-5xl text-white'>Whatsapp</span></div>
            </div>
            <SignInButton>
                <div className=' bg-black p-5 flex  gap-3 items-center'>
                <FcGoogle size={40}/>
               <span className="text-white">Login with Google</span> 
                </div>
           
            </SignInButton>
            
        </div>
    )
}

export default Login;