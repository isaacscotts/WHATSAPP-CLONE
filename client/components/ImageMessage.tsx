import { HOST } from "@/utils/ApiRoutes"
import Image from "next/image"
const ImageMessage=({message})=>{
   return (
    <div>
        <img src={`${HOST}/${message}`} width={300} height={300}/>
    </div>
   )
}
export default ImageMessage