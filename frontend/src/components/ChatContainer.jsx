import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useAiStore, NOVA_BOT_ID } from "../store/useAiStore";
import { useEffect, useRef } from "react";
import { Check, CheckCheck, Lock, Bot } from "lucide-react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import AiSummaryModal from "./AiSummaryModal";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    isPeerTyping,
  } = useChatStore();

  const { authUser } = useAuthStore();
  const { novaMessages, isNovaLoading } = useAiStore();
  const messageEndRef = useRef(null);

  const isNovaBot = selectedUser?._id === NOVA_BOT_ID;
  const activeMessages = isNovaBot ? novaMessages : messages;

  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
      subscribeToMessages();
    }

    return () => unsubscribeFromMessages();
  }, [selectedUser?._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current && activeMessages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeMessages, isPeerTyping, isNovaLoading]);

  if (isMessagesLoading && !isNovaBot) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto relative">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Banner for encryption status */}
        {!isNovaBot && (
          <div className="flex items-center justify-center my-2">
            <div className="flex items-center gap-1.5 bg-base-200/70 border border-base-300 text-base-content/60 text-[11px] px-3 py-1 rounded-full shadow-sm">
              <Lock className="size-3 text-emerald-500" />
              <span>Messages are end-to-end encrypted with AES-GCM 256-bit</span>
            </div>
          </div>
        )}

        {activeMessages.map((message) => {
          const isSender = isNovaBot
            ? message.senderId !== NOVA_BOT_ID
            : message.senderId === authUser?._id;

          return (
            <div
              key={message._id}
              className={`chat ${isSender ? "chat-end" : "chat-start"}`}
            >
              <div className="chat-image avatar">
                <div className="size-10 rounded-full border border-base-300">
                  {isNovaBot && message.senderId === NOVA_BOT_ID ? (
                    <div className="size-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-primary-content">
                      <Bot className="size-5" />
                    </div>
                  ) : (
                    <img
                      src={
                        isSender
                          ? authUser?.profilePic || "/avatar.png"
                          : selectedUser?.profilePic || "/avatar.png"
                      }
                      alt="profile pic"
                      className="object-cover"
                    />
                  )}
                </div>
              </div>

              <div className="chat-header mb-1 flex items-center gap-1">
                <time className="text-[11px] opacity-60">
                  {formatMessageTime(message.createdAt)}
                </time>
                {message.isEncrypted && (
                  <span title="Encrypted" className="opacity-50">
                    <Lock className="size-2.5 text-emerald-500 inline" />
                  </span>
                )}
              </div>

              <div
                className={`chat-bubble flex flex-col relative ${
                  isSender ? "bg-primary text-primary-content" : "bg-base-200 text-base-content"
                }`}
              >
                {message.image && (
                  <img
                    src={message.image}
                    alt="Attachment"
                    className="sm:max-w-[240px] rounded-lg mb-2 object-cover border border-base-content/10"
                  />
                )}
                {message.text && (
                  <p className="whitespace-pre-wrap leading-relaxed text-sm">{message.text}</p>
                )}

                {/* Delivery / Read checkmark status for sender */}
                {isSender && !isNovaBot && (
                  <div className="self-end mt-1 flex items-center gap-0.5 opacity-80">
                    {message.status === "seen" ? (
                      <CheckCheck className="size-3.5 text-sky-300" title="Seen" />
                    ) : message.status === "delivered" ? (
                      <CheckCheck className="size-3.5 text-base-content/70" title="Delivered" />
                    ) : (
                      <Check className="size-3.5 text-base-content/70" title="Sent" />
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Typing indicator bubble */}
        {(isPeerTyping || (isNovaBot && isNovaLoading)) && (
          <div className="chat chat-start animate-in fade-in duration-200">
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border border-base-300">
                {isNovaBot ? (
                  <div className="size-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-primary-content">
                    <Bot className="size-5" />
                  </div>
                ) : (
                  <img
                    src={selectedUser?.profilePic || "/avatar.png"}
                    alt="avatar"
                    className="object-cover"
                  />
                )}
              </div>
            </div>
            <div className="chat-bubble bg-base-200 text-base-content py-3 px-4">
              <div className="flex items-center gap-1.5">
                <span className="size-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="size-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="size-2 bg-primary rounded-full animate-bounce" />
              </div>
            </div>
          </div>
        )}

        <div ref={messageEndRef} />
      </div>

      <MessageInput />
      <AiSummaryModal />
    </div>
  );
};

export default ChatContainer;
