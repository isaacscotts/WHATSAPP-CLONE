
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
      isAudioCall:false,
      callPeerId: null,
      peerSocketId: null,

setPeerSocketId: (id) => set({ peerSocketId: id }),
      setCallPeerId: (id) => set({ callPeerId: id }),
      setIsAudioCall:(info)=>set({isAudioCall:info}),
      setAudioUnlocked:(info)=>set({audioUnlocked:info}),
      setIsCalling:(info)=>set({isCalling:info}),
      endCall:()=>set({
        incomingCall:null,
        isVideoCall:false,
        isAudioCall:false,
        callPeerId:false
      }),
      updateMessageByTempId: (tempId, newMessage) =>
  set((state) => ({
    messages: state.messages.map((msg) =>
      msg.tempId === tempId ? { ...msg, ...newMessage } : msg
    ),
  })),
    setMessagesSeen:(msgIds)=>set((state)=>({
       messages:state.messages.map((msg)=>
        msgIds.includes(msg.id) ?{...msg,messageStatus:"read"}:msg
      )
    }))
  ,
     setMessageDelivered:(messageId)=>set((state)=>({
      messages:state.messages.map((msg)=>
        msg.id===messageId ?{...msg,messageStatus:"delivered"}:msg
      )
     })),
      setIncomingCall:(from)=>set({incomingCall:from}),
      isScreenShare:false,
      setIsScreenShare:(info)=>set({isScreenShare:info}),
      setIsVideoCall:(info)=>set({isVideoCall:info}),
      setPlayingMessageId:(id)=>set({playingMessageId:id}),
      setUserInfo:(info)=>set({userInfo:info}),
      setMessages:(info)=>set({messages:info}),
      clearMessages:()=>set({messages:[]}),
      setContactsPage:()=>set((state)=>({contactsPage:!state.contactsPage})),
     addMessager:(message)=>set((state)=>({messages:[...state.messages,message]})), 
      setCurrentChatUser:(userInfo)=>set({currentChatUser:userInfo})
    }),
    {name:'userStore'}
))

export default useUserStore;