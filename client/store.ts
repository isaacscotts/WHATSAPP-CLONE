
import {create} from "zustand"
import {persist} from "zustand/middleware"


const useUserStore=create()(persist(
    (set,get)=>({
      userInfo:[],
      contactsPage:true,
      currentChatUser:null,
      messages:[],
      playingMessageId:null,
      isVideoCall:false,
      incomingCall:null,
      isCalling:false,
      audioUnlocked:false,
      isAudioCall:true,
      setIsAudioCall:(info)=>set({isAudioCall:info}),
      setAudioUnlocked:(info)=>set({audioUnlocked:info}),
      setIsCalling:(info)=>set({isCalling:info}),
      endCall:()=>set({
        incomingCall:null,
        isVideoCall:false,
        isAudioCall:false
      }),
      setIncomingCall:(from)=>set({incomingCall:from}),
      isScreenShare:false,
      setIsScreenShare:(info)=>set({isScreenShare:info}),
      setIsVideoCall:(info)=>set({isVideoCall:info}),
      setPlayingMessageId:(id)=>set({playingMessageId:id}),
      setUserInfo:(info)=>set({userInfo:info}),
      setMessages:(info)=>set({messages:info}),
      setContactsPage:()=>set((state)=>({contactsPage:!state.contactsPage})),
     addMessager:(message)=>set((state)=>({messages:[...state.messages,message]})), 
      setCurrentChatUser:(userInfo)=>set({currentChatUser:userInfo})
    }),
    {name:'userStore'}
))

export default useUserStore;