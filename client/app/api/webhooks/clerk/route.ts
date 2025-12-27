import {Webhook} from "svix";
import {headers} from "next/headers";
import {WebhookEvent} from "@clerk/nextjs/server"
import { db } from "@/utils/PrismaClient";
export async function POST(req){
   try{
      const WEBHOOK_SECRET=process.env.WEBHOOK_SIGNING_SECRET
      if(!WEBHOOK_SECRET){
        console.log()
        throw new Error("please there is no signing secret in env")
      }

      const headerPayload=await headers()
      const svix_id=headerPayload.get('svix-id')
      const svix_siganture=headerPayload.get("svix-signature")
      const svix_timestamp=headerPayload.get("svix-timestamp")

      if(!svix_id || !svix_siganture || !svix_timestamp){
        return new Response("no svix headers")
      }

      const payload=await req.json()
      const body=JSON.stringify(payload)

      let evt;
      let wh=new Webhook(WEBHOOK_SECRET)

      try{
        evt=await wh.verify(body,{
            "svix-id":svix_id,
            "svix-signature":svix_siganture,
            "svix-timestamp":svix_timestamp,
        })
      }
      catch(err){
        console.log(err)
      }
      const {id}=evt.data
      let evtType=evt.type

      if(evtType==="user.created"){
        const {first_name,last_name,profile_image_url,email_addresses}=evt.data
         const email=email_addresses[0].email_address
        const send={
            email,
            firstName:first_name,
            lastName:last_name,
            profilePic:profile_image_url,
            clerkId:id
        }
         const check=await db.user.findUnique({where:{clerkId:id}})
         if(check){
            return new Response("user already exists in our database")
         }

         const newUser=await db.user.create({
            data:send
         })
        console.log("new user created",newUser)
        return new Response("success")
      }
       
    
   }

   catch(err){
     console.log(err)
   }
}