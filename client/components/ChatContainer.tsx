"use client";

import useUserStore from "@/store";
import ImageMessage from "./ImageMessage";
import VoiceMessage from "./VoiceMessage";
import TextMessage from "./TextMessage";
import { useEffect, useMemo } from "react";
import { useSocketContext } from "@/SocketContext";


const ChatContainer = () => {
  const { messages, currentChatUser, userInfo } = useUserStore();
  const socket = useSocketContext();

  
  const chatMessages = useMemo(() => {
    if (!currentChatUser || !userInfo) return [];

    return messages
      .filter(
        (m) =>
          (m.senderId === userInfo.id &&
            m.receiverId === currentChatUser.id) ||
          (m.senderId === currentChatUser.id &&
            m.receiverId === userInfo.id)
      )
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() -
          new Date(b.createdAt).getTime()
      );
  }, [messages, currentChatUser?.id]);


 useEffect(() => {
  if (!currentChatUser || !socket) return;

  const unreadIds = chatMessages
    .filter(
      (m) =>
        m.senderId === currentChatUser.id &&
        m.receiverId === userInfo.id &&
        m.messageStatus !== "read"
    )
    .map((m) => m.id);

  if (unreadIds.length === 0) return;

  console.log("📤 emitting msg-read", unreadIds);

  socket.emit("msg-read", {
    from: currentChatUser.id,
    to: userInfo.id,
    messageIds: unreadIds,
  });
}, [currentChatUser?.id, chatMessages.length]);


  return (
    <div className="bg-black pt-1 flex-1 overflow-y-auto flex-col gap-2 text-white">
      {chatMessages.map((message) => (
        <div
          key={message.id || message.tempId}
          className={`flex mb-1 ${
            message.senderId === userInfo.id
              ? "justify-end"
              : "justify-start"
          }`}
        >
          <div
            className={`flex rounded ${
              message.senderId === userInfo.id
                ? "bg-green-900"
                : "bg-gray-600"
            }`}
          >
            {message.type === "text" && (
              <TextMessage message={message} />
            )}
            {message.type === "image" && (
              <ImageMessage message={message} />
            )}
            {message.type === "audio" && (
              <VoiceMessage message={message} />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatContainer;
