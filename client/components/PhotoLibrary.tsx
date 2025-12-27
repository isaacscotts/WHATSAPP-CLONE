import Image from "next/image"
import { IoClose } from "react-icons/io5";
const PhotoLibrary=({hide,setImage})=>{
    const photos=[
        "/avatars/1.png",
        "/avatars/2.png",
        "/avatars/3.png",
        "/avatars/4.png",
        "/avatars/5.png",
        "/avatars/6.png",
        "/avatars/7.png",
        "/avatars/8.png",
        "/avatars/9.png"
    ]

    const handleClick=(image)=>{
        setImage(image)
        hide(false)
    }
    
  return (
    <div className="absolute top-[20%] left-[34%] bg-black w-[27%] h-[55%]">
        <div className="text-white flex justify-end"><IoClose onClick={()=>hide(false)} className="cursor-pointer" size={34}/></div>
        <div className="grid grid-cols-3 gap-3 pl-2 items-center justify-center">
            {photos.map((image,index)=>( 
        <div key={index} onClick={()=>handleClick(image)} className="h-20 w-20 relative">
            <Image src={image} fill alt="avatar"/>
        </div>
      ))}
   
        </div>
      
    </div>
  )
}

export default PhotoLibrary;