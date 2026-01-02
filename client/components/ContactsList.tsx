"use client"
import useUserStore from "@/store";
import { getAllUsers } from "@/utils/ApiRoutes";
import { useEffect, useState } from "react";
import { IoMdArrowRoundBack } from "react-icons/io";
import { IoSearchSharp } from "react-icons/io5";
import Avatar from "./Avatar";
import { userInfo } from "os";

const ContactsList=()=>{
    const [allContacts,setAllContacts]=useState([])
    const {setContactsPage,userInfo,clearMessages,currentChatUser,setCurrentChatUser}=useUserStore()

    const handleBack=()=>{
     setContactsPage()
    }
const handleContactClick=(user)=>{
     if(user?.id===currentChatUser?.id) return;
     setCurrentChatUser(user)
     clearMessages()
}
useEffect(()=>{
     const getContacts=async ()=>{
          try{
            const response=await fetch(`${getAllUsers}/${userInfo?.id}`)
            const {users}=await response.json()
            console.log('users',users)
            setAllContacts(users)
          }
          catch(err){
          console.log(err)
          }
     }
     getContacts()
},[])



     return (
        <div className="h-79">
             <div className="bg-amber-500 h-15 flex pl-3 flex-col  justify-center">
                       <div onClick={()=>handleBack()} className="flex items-center gap-5">
                            <IoMdArrowRoundBack color="white" />
                            <div><span className="text-white">New Chat</span></div>
                       </div>
                   </div>

                   <div className="mt-3 relative">
                               <input type="text" placeholder="Search Contacts" className="focus:outline-none pl-10 p-1 bg-black w-full rounded text-white"/>
                               <div className="absolute top-[30%] left-3 text-white"><IoSearchSharp/></div>
                            </div>

                  <div>
                    {Object.entries(allContacts).map(([initialLetter,users])=>{
                         return (
                              <div className="pt-1 pl-2" key={Date.now()+initialLetter}>
                                   <span className="text-white">{initialLetter}</span>

                                   <div className="pt-2">
                                        {users.map((user,index)=>(
                                             <div key={index} onClick={()=>handleContactClick(user)} className="flex gap-4">
                                                  <Avatar type="sm" image={user?.profilePic}/>
                                                  <div>
                                                      <div><span className="text-white line-clamp-1">{user.username}</span></div> 
                                                      <div><span className="line-clamp-1">{user?.about}</span></div>
                                                  </div>
                                             </div>
                                        ))}
                                   </div>
                              </div>
                         )
                    })}
                  </div>

              
        </div>
     )

}

export default ContactsList;