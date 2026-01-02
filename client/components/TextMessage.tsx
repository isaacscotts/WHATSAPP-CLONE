import useUserStore from "@/store";
import { MdDone, MdDoneAll } from "react-icons/md";

const TextMessage=({message})=>{
    const {userInfo}=useUserStore()
  return (
    <div className="flex flex-col">
     <div><span>{message?.message}</span></div>
     <div className="flex justify-end">
         {message.messageStatus==="sent" &&  message.senderId===userInfo?.id && (<span><MdDone/></span>)}
                                  {message.messageStatus==="sending"&& message.senderId===userInfo?.id && (<span>🕒</span>)}
                                  {message.messageStatus==="delivered"&& message.senderId===userInfo?.id && (<span><MdDoneAll/></span>)}
                                   {message.messageStatus==="read" && message.senderId===userInfo?.id && (<span><MdDoneAll className="text-blue-500 text-sm" /></span>)}
            
     </div>
    </div>
  )
}

export default TextMessage;