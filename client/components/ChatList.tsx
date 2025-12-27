'use client'
import useUserStore from "@/store";
import ChatListHeader from "./ChatListHeader";
import List from "./List";
import SearchBar from "./SearchBar";
import { useEffect, useState } from "react";
import ContactsList from "./ContactsList";

const Chat=()=>{
    const {contactsPage}=useUserStore()
    const [pageType,setPageType]=useState("default")

    useEffect(()=>{
        if(contactsPage){
            setPageType("all-contacts")
        }
        else{
            setPageType("default")
        }
    },[contactsPage])
   return (
    <div className="bg-green-800 h-screen w-[30%]">
       {pageType==="default" && (
          <>
          <ChatListHeader/>
        <SearchBar/>
        <List/>
          </>
       )}

       {pageType==="all-contacts" && (
        <>
        <ContactsList/>
        </>
       )}
    
        
    </div>
   )
}
export default Chat;