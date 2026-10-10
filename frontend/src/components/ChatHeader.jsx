import { useState } from "react";
import { X, Lock, Sparkles, Bot, ShieldCheck } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useAiStore, NOVA_BOT_ID } from "../store/useAiStore";
import SecurityModal from "./SecurityModal";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, isPeerTyping, messages } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const { summarizeConversation, isSummarizing } = useAiStore();
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);

  if (!selectedUser) return null;

  const isNovaBot = selectedUser._id === NOVA_BOT_ID;
  const isOnline = onlineUsers.includes(selectedUser._id);

  const handleSummarize = () => {
    summarizeConversation(messages);
  };

  return (
    <>
      <div className="p-3 border-b border-base-300 bg-base-100/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="avatar">
              <div className="size-10 rounded-full relative border border-base-300">
                {isNovaBot ? (
                  <div className="size-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-primary-content">
                    <Bot className="size-5" />
                  </div>
                ) : (
                  <img
                    src={selectedUser.profilePic || "/avatar.png"}
                    alt={selectedUser.fullName}
                    className="object-cover"
                  />
                )}
              </div>
            </div>

            {/* User info */}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm sm:text-base leading-tight">
                  {selectedUser.fullName}
                </h3>
                {!isNovaBot && (
                  <button
                    onClick={() => setIsSecurityModalOpen(true)}
                    className="inline-flex items-center gap-1 text-[11px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 px-2 py-0.5 rounded-full font-medium transition-colors"
                    title="Click to verify End-to-End Encryption"
                    type="button"
                  >
                    <Lock className="size-2.5" />
                    <span className="hidden sm:inline">E2EE</span>
                  </button>
                )}
              </div>

              {/* Status / Typing */}
              {isNovaBot ? (
                <p className="text-xs text-primary font-medium flex items-center gap-1">
                  <Sparkles className="size-3" />
                  <span>Google Gemini Flash • In-App AI</span>
                </p>
              ) : isPeerTyping ? (
                <p className="text-xs text-emerald-500 font-medium flex items-center gap-1 animate-pulse">
                  <span className="inline-block size-1.5 rounded-full bg-emerald-500" />
                  <span>typing...</span>
                </p>
              ) : (
                <p className="text-xs text-base-content/60">
                  {isOnline ? "Online" : "Offline"}
                </p>
              )}
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-1.5">
            {!isNovaBot && messages.length > 0 && (
              <button
                onClick={handleSummarize}
                disabled={isSummarizing}
                type="button"
                className="btn btn-ghost btn-xs sm:btn-sm gap-1.5 text-xs text-primary hover:bg-primary/10 rounded-lg"
                title="Summarize chat with AI"
              >
                <Sparkles className={`size-3.5 ${isSummarizing ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Summarize</span>
              </button>
            )}

            {!isNovaBot && (
              <button
                onClick={() => setIsSecurityModalOpen(true)}
                type="button"
                className="btn btn-ghost btn-circle btn-sm text-base-content/60 hover:text-emerald-500"
                title="Encryption details"
              >
                <ShieldCheck className="size-4" />
              </button>
            )}

            {/* Close chat button */}
            <button
              onClick={() => setSelectedUser(null)}
              className="btn btn-ghost btn-circle btn-sm"
              type="button"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <SecurityModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
      />
    </>
  );
};

export default ChatHeader;
