import { db } from "../utils/PrismaClient.js";
export const checkUser=async (req,res,next)=>{
    const {clerkId} =req.body;
   try{
    if(!clerkId){
        return res.status(401).json({message:"no clerk id found"})
    }
     const user=await db.user.findUnique({where:{clerkId}})
     if(!user){
        return res.json({message:"user not found",status:false})
     }
    
     
    
     return res.status(200).json({message:"user found",data:user,status:true})
     
   }
   catch(error){
      next(error)
   }
}

export const onboardUser=async (req,res,next)=>{
   const {username,about,clerkId,image}=req.body
   
   try{
      if(!clerkId){
         return res.status(401).json({message:'clerk id not found',status:false})
      }
      const checkUser=await db.user.findUnique({where:{clerkId}})
      if(!checkUser){
         return res.status(401).json({message:"user not found",status:false})
      }
      const updatedUser=await db.user.update({where:{clerkId},
         data:{username,about,onboarding:true,profilePic:image}
      })

      res.status(201).json({message:'user updated',status:true,data:updatedUser})
      
       
   }
   catch(err){
      
      next(err)
   }
}

export const allContacts=async (req,res,next)=>{
   try{
      const users=await db.user.findMany({
         orderBy:{username:"asc"},
         select:{
            id:true,
            username:true,
            profilePic:true,
            about:true,
            email:true
         }
      })

      const usersGroupedByLetter={}

      users.forEach((user)=>{
         const initialLetter=user.username?.charAt(0).toUpperCase()
         if(!usersGroupedByLetter[initialLetter]){
            usersGroupedByLetter[initialLetter]=[]
         }
         usersGroupedByLetter[initialLetter].push(user)
   })

      res.status(200).json({message:"all contacts",users:usersGroupedByLetter,success:true})

      console.log('users',users)
   }
   catch(err){
     next(err)
   }
}