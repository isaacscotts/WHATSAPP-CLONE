import Image from "next/image"
const Empty=()=>{
  return (
    <div className="flex h-screen flex-1 bg-amber-800 flex-col items-center justify-center">
        <Image src={"/whatsapp.gif"} width={300} height={300} alt="tsup logo"/>
    </div>
  )
}

export default Empty;