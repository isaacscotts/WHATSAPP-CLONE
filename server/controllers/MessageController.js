import { renameSync } from "fs"
import { db } from "../utils/PrismaClient.js"
import {rename} from "fs/promises"
export const addMessage=async (req,res,next)=>{
    const {from,to,message}=req.body
    console.log('new message',from,to,message)
     try{
        const newMessage=await db.messages.create({
            data:{
                 senderId:parseInt(from),
                 receiverId:parseInt(to),
                message
            },

        })
        
        return res.status(201).json({message:"youre message has been saved",data:newMessage})
     }
     catch(err){
        console.log(err)
        next(err)
     }
}

export const getAllMessagges=async(req,res,next)=>{
    const {from,to}=req.params;
   
    try{
             const messages=await db.messages.findMany({
                where:{
                    OR:[
                    {senderId:parseInt(from),
                    receiverId:parseInt(to)},
                    {senderId:parseInt(to),
                    receiverId:parseInt(from)}
                    
                    ]
                    
                }
             })
             res.status(200).json({message:"success",data:messages})
    }

    catch(err){
        console.log(err)
        next(err)
    }
}

export const addImageMessage=async(req,res,next)=>{
    const {from,to}=req.params
    console.log("params",from,to)
  try{
      if(req.file){
        console.log("file attached",req.file.originalname)
        const date=Date.now()
        const fileName=`uploads/images/${date}-${req.file.originalname}`
        rename(req.file.path,fileName)
      

        const newMessage=await db.messages.create({
            data:{
                sender:{connect:{id:parseInt(from)}},
                receiver:{connect:{id:parseInt(to)}},
                message:fileName,
                type:"image"
            }
        })
        return res.status(201).json({status:true,newMessage})
      }
  } 
  catch(err){
    next(err)
  }
}

export const addVoiceMessage=async(req,res,next)=>{
    const {from,to}=req.params;
  
  try{
      if(req.file){
         console.log("file available hey")
         const date=Date.now()
         const fileName=`uploads/recordings/${date}-${req.file.originalname}`
         
         rename(req.file.path,fileName)

         const newMessage=await db.messages.create({
            data:{
              sender:{connect:{id:parseInt(from)}},
              receiver:{connect:{id:parseInt(to)}},
              message:fileName,
              type:"audio"
            }
         })


          return res.json({message:"success",newMessage,status:true})

      }
      }
  catch(err){
    next(err)
  }
}