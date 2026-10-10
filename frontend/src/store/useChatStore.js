import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import { useAiStore, NOVA_BOT_ID } from "./useAiStore";
import { encryptMessageText, decryptMessageText } from "../lib/crypto";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isPeerTyping: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load contacts");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    if (userId === NOVA_BOT_ID) {
      set({ messages: [] });
      return;
    }

    set({ isMessagesLoading: true, isPeerTyping: false });
    const authUser = useAuthStore.getState().authUser;
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      const rawMessages = res.data || [];

      // Decrypt all messages client-side
      const decryptedMessages = await Promise.all(
        rawMessages.map(async (msg) => {
          let plainText = msg.text;
          if (msg.iv && authUser) {
            plainText = await decryptMessageText(msg.text, msg.iv, authUser._id, userId);
          }
          return {
            ...msg,
            text: plainText,
            isEncrypted: Boolean(msg.iv),
          };
        })
      );

      set({ messages: decryptedMessages });

      // Check if last message was from the peer to generate AI Smart Replies
      if (decryptedMessages.length > 0) {
        const lastMsg = decryptedMessages[decryptedMessages.length - 1];
        if (lastMsg.senderId === userId && lastMsg.text) {
          const selectedUser = get().selectedUser;
          useAiStore.getState().fetchSmartReplies(lastMsg.text, selectedUser?.fullName);
        } else {
          useAiStore.getState().clearSmartReplies();
        }
      } else {
        useAiStore.getState().clearSmartReplies();
      }

      // Mark messages as seen
      get().markMessagesSeen(userId);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    if (!selectedUser) return;

    // Special routing for Nova AI Companion
    if (selectedUser._id === NOVA_BOT_ID) {
      if (messageData.text) {
        await useAiStore.getState().sendNovaMessage(messageData.text);
      }
      return;
    }

    const authUser = useAuthStore.getState().authUser;

    try {
      let cipherText = messageData.text || "";
      let iv = null;

      // Encrypt text client-side before dispatching
      if (messageData.text && authUser) {
        const encrypted = await encryptMessageText(messageData.text, authUser._id, selectedUser._id);
        cipherText = encrypted.cipherText;
        iv = encrypted.iv;
      }

      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, {
        text: cipherText,
        iv,
        image: messageData.image,
      });

      // Local message display with decrypted text
      const localMessage = {
        ...res.data,
        text: messageData.text, // Show original plain text on sender client
        isEncrypted: Boolean(iv),
      };

      set({ messages: [...messages, localMessage] });

      // Update sidebar's lastMessage for selectedUser
      set({
        users: get().users.map((u) =>
          u._id === selectedUser._id
            ? { ...u, lastMessage: { ...res.data, text: messageData.text } }
            : u
        ),
      });

      // Clear AI smart replies after sending
      useAiStore.getState().clearSmartReplies();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  sendTyping: () => {
    const { selectedUser } = get();
    const socket = useAuthStore.getState().socket;
    if (!selectedUser || !socket || selectedUser._id === NOVA_BOT_ID) return;
    socket.emit("typing", { receiverId: selectedUser._id });
  },

  sendStopTyping: () => {
    const { selectedUser } = get();
    const socket = useAuthStore.getState().socket;
    if (!selectedUser || !socket || selectedUser._id === NOVA_BOT_ID) return;
    socket.emit("stopTyping", { receiverId: selectedUser._id });
  },

  markMessagesSeen: async (userId) => {
    if (!userId || userId === NOVA_BOT_ID) return;
    try {
      await axiosInstance.put(`/messages/mark-seen/${userId}`);
      // Zero out unread count in local users list
      set({
        users: get().users.map((u) =>
          u._id === userId ? { ...u, unreadCount: 0 } : u
        ),
      });
    } catch (err) {
      // Quiet fail for seen status
    }
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on("newMessage", async (newMessage) => {
      const { selectedUser, messages, users } = get();
      const authUser = useAuthStore.getState().authUser;

      // Decrypt message
      let decryptedText = newMessage.text;
      if (newMessage.iv && authUser) {
        decryptedText = await decryptMessageText(
          newMessage.text,
          newMessage.iv,
          authUser._id,
          newMessage.senderId
        );
      }

      const formattedMessage = {
        ...newMessage,
        text: decryptedText,
        isEncrypted: Boolean(newMessage.iv),
      };

      if (selectedUser && selectedUser._id === newMessage.senderId) {
        // Active chat window: append message, update smart replies, mark seen
        set({ messages: [...messages, formattedMessage] });
        useAiStore.getState().fetchSmartReplies(decryptedText, selectedUser.fullName);
        get().markMessagesSeen(selectedUser._id);
      } else {
        // Background message: increment unread count on sidebar
        set({
          users: users.map((u) =>
            u._id === newMessage.senderId
              ? {
                  ...u,
                  unreadCount: (u.unreadCount || 0) + 1,
                  lastMessage: { ...newMessage, text: decryptedText },
                }
              : u
          ),
        });
      }
    });

    socket.on("userTyping", ({ senderId }) => {
      const { selectedUser } = get();
      if (selectedUser && selectedUser._id === senderId) {
        set({ isPeerTyping: true });
      }
    });

    socket.on("userStopTyping", ({ senderId }) => {
      const { selectedUser } = get();
      if (selectedUser && selectedUser._id === senderId) {
        set({ isPeerTyping: false });
      }
    });

    socket.on("messagesSeen", ({ seenBy }) => {
      const { selectedUser, messages } = get();
      if (selectedUser && selectedUser._id === seenBy) {
        set({
          messages: messages.map((m) =>
            m.senderId !== seenBy ? { ...m, status: "seen" } : m
          ),
        });
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("newMessage");
    socket.off("userTyping");
    socket.off("userStopTyping");
    socket.off("messagesSeen");
  },

  setSelectedUser: (selectedUser) => {
    set({ selectedUser, isPeerTyping: false });
    useAiStore.getState().clearSmartReplies();
  },
}));
