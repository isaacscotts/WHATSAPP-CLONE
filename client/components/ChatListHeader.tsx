"use client"
import { IoMdArrowRoundBack } from "react-icons/io";
import { LuMessageSquare } from "react-icons/lu";
import { BsThreeDotsVertical } from "react-icons/bs";
import Avatar from "./Avatar";
import useUserStore from "@/store";
const ChatListHeader=()=>{
    const {userInfo,setContactsPage}=useUserStore()
    console.log(userInfo)

     const handleBack=()=>{
     setContactsPage()
    }

    return (
        <div className="bg-amber-500 flex justify-between">
        <Avatar type={"sm"} image={userInfo?.profilePic}/>
        <div className="flex gap-5 items-center text-white ">
            <LuMessageSquare size={34} onClick={()=>handleBack()}/>
            <BsThreeDotsVertical size={34}/>
        </div>
        </div>
    )
}

export default ChatListHeader;