import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

// Virtual Nova AI bot profile for display in chat/sidebar
export const NOVA_BOT_ID = "nova_ai_assistant_bot_id";
export const NOVA_BOT_USER = {
  _id: NOVA_BOT_ID,
  fullName: "Nova AI Assistant",
  email: "nova@assistant.ai",
  profilePic: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80",
  isBot: true,
};

export const useAiStore = create((set, get) => ({
  smartReplies: [],
  isGeneratingReplies: false,

  isPolishing: false,
  isSummarizing: false,
  summaryData: null,
  isSummaryModalOpen: false,
  isPolishModalOpen: false,

  // Nova AI conversation history
  novaMessages: [
    {
      _id: "nova_welcome_msg",
      senderId: NOVA_BOT_ID,
      text: "Hi there! 👋 I'm **Nova AI**, your in-app intelligent assistant. You can ask me questions, practice interview questions, write code, or draft messages!",
      createdAt: new Date().toISOString(),
      isNova: true,
      status: "seen",
    },
  ],
  isNovaLoading: false,

  setSummaryModalOpen: (isOpen) => set({ isSummaryModalOpen: isOpen }),
  setPolishModalOpen: (isOpen) => set({ isPolishModalOpen: isOpen }),

  fetchSmartReplies: async (lastMessage, senderName) => {
    if (!lastMessage || typeof lastMessage !== "string") return;
    set({ isGeneratingReplies: true });
    try {
      const res = await axiosInstance.post("/ai/smart-replies", {
        lastMessage,
        senderName,
      });
      if (res.data?.replies) {
        set({ smartReplies: res.data.replies });
      }
    } catch (error) {
      console.warn("Failed to fetch smart replies:", error);
    } finally {
      set({ isGeneratingReplies: false });
    }
  },

  clearSmartReplies: () => set({ smartReplies: [] }),

  polishDraft: async (text, tone) => {
    if (!text?.trim()) return text;
    set({ isPolishing: true });
    try {
      const res = await axiosInstance.post("/ai/polish", { text, tone });
      return res.data?.polished || text;
    } catch (error) {
      toast.error("Could not polish message");
      return text;
    } finally {
      set({ isPolishing: false });
    }
  },

  summarizeConversation: async (messages) => {
    if (!messages || messages.length === 0) {
      toast("No messages to summarize");
      return;
    }
    set({ isSummarizing: true, isSummaryModalOpen: true });
    try {
      const res = await axiosInstance.post("/ai/summarize", {
        messages: messages.map((m) => ({
          text: m.text,
          senderName: m.senderId === NOVA_BOT_ID ? "Nova" : "User",
        })),
      });
      set({ summaryData: res.data });
    } catch (error) {
      toast.error("Failed to generate summary");
    } finally {
      set({ isSummarizing: false });
    }
  },

  sendNovaMessage: async (userText) => {
    if (!userText?.trim()) return;

    const userMsg = {
      _id: "user_" + Date.now(),
      senderId: "currentUser",
      text: userText.trim(),
      createdAt: new Date().toISOString(),
      status: "seen",
    };

    const currentNovaMessages = get().novaMessages;
    set({
      novaMessages: [...currentNovaMessages, userMsg],
      isNovaLoading: true,
    });

    try {
      const history = currentNovaMessages.map((m) => ({
        role: m.senderId === NOVA_BOT_ID ? "model" : "user",
        content: m.text,
      }));

      const res = await axiosInstance.post("/ai/chat", {
        message: userText.trim(),
        history,
      });

      const replyText = res.data?.reply || "I didn't catch that. Could you try asking again?";

      const novaReplyMsg = {
        _id: "nova_" + Date.now(),
        senderId: NOVA_BOT_ID,
        text: replyText,
        createdAt: new Date().toISOString(),
        isNova: true,
        status: "seen",
      };

      set({ novaMessages: [...get().novaMessages, novaReplyMsg] });
    } catch (error) {
      toast.error("Nova AI is momentarily unavailable");
    } finally {
      set({ isNovaLoading: false });
    }
  },
}));
