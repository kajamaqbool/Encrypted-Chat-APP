import { ShieldCheck, Lock, Sparkles, Zap, Bot } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { NOVA_BOT_USER } from "../store/useAiStore";

const NoChatSelected = () => {
  const { setSelectedUser } = useChatStore();

  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-8 sm:p-16 bg-base-100/50">
      <div className="max-w-md text-center space-y-6">
        {/* Animated Icon Display */}
        <div className="flex justify-center gap-4 mb-2">
          <div className="relative">
            <div className="size-20 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-primary-content shadow-lg shadow-primary/20 animate-pulse">
              <ShieldCheck className="size-10" />
            </div>
            <div className="absolute -top-1 -right-1 size-7 rounded-full bg-emerald-500 flex items-center justify-center text-white ring-4 ring-base-100 shadow-sm">
              <Lock className="size-3.5" />
            </div>
          </div>
        </div>

        {/* Welcome Text */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Encrypted Chat App</h2>
          <p className="text-base-content/60 text-sm mt-1.5">
            Private, end-to-end encrypted messaging with Google Gemini AI assistance.
          </p>
        </div>

        {/* Feature Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          <span className="badge badge-outline gap-1.5 py-3 px-3 text-xs">
            <Lock className="size-3 text-emerald-500" />
            <span>AES-GCM 256-bit</span>
          </span>
          <span className="badge badge-outline gap-1.5 py-3 px-3 text-xs">
            <Sparkles className="size-3 text-primary" />
            <span>Gemini AI Suite</span>
          </span>
          <span className="badge badge-outline gap-1.5 py-3 px-3 text-xs">
            <Zap className="size-3 text-amber-500" />
            <span>Socket.IO Sockets</span>
          </span>
        </div>

        {/* Quick CTA to try Nova AI bot */}
        <div className="pt-2">
          <button
            onClick={() => setSelectedUser(NOVA_BOT_USER)}
            className="btn btn-primary btn-sm rounded-xl gap-2 shadow-md hover:shadow-primary/30 transition-all"
            type="button"
          >
            <Bot className="size-4" />
            <span>Chat With Nova AI</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoChatSelected;
