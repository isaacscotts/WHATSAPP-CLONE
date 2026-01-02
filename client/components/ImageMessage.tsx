import useUserStore from "@/store"
import { HOST } from "@/utils/ApiRoutes"
import Image from "next/image"
import { MdDone, MdDoneAll } from "react-icons/md"
const ImageMessage=({message})=>{
    const {userInfo}=useUserStore()
    const url=message?.isLocal?message?.message:`${HOST}/${message?.message}`
   return (
    <div className="relative">
        <img src={url} width={300} height={300}/>
        <div className="absolute  bottom-0 right-1 ">
            {message.messageStatus==="sent" &&  message.senderId===userInfo?.id &&  (<span><MdDone/></span>)}
                          {message.messageStatus==="sending"&&  message.senderId===userInfo?.id &&   (<span>🕒</span>)}
                          {message.messageStatus==="delivered"&&  message.senderId===userInfo?.id &&  (<span><MdDoneAll/></span>)}
                           {message.messageStatus==="read"&&   message.senderId===userInfo?.id &&  (<span><MdDoneAll className="text-blue-500 text-sm" /></span>)}
        </div>
    </div>
   )
}
export default ImageMessage