import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { NOVA_BOT_USER, NOVA_BOT_ID } from "../store/useAiStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, Search, Bot, Sparkles, X } from "lucide-react";
import { formatMessageTime } from "../lib/utils";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const filteredUsers = users.filter((user) => {
    const matchesOnline = showOnlineOnly ? onlineUsers.includes(user._id) : true;
    const matchesSearch = searchQuery.trim()
      ? user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesOnline && matchesSearch;
  });

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      {/* Top Header */}
      <div className="border-b border-base-300 w-full p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="size-5 text-primary" />
            <span className="font-semibold text-base hidden lg:block">Chats</span>
          </div>
          <span className="hidden lg:block text-xs text-base-content/60">
            {users.length} contacts
          </span>
        </div>

        {/* Search Input (Hidden on mobile icon bar) */}
        <div className="mt-3 relative hidden lg:block">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input input-sm input-bordered w-full pl-9 pr-8 text-xs rounded-lg"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Online Filter Toggle */}
        <div className="mt-2.5 hidden lg:flex items-center justify-between">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-xs checkbox-primary"
            />
            <span className="text-xs text-base-content/80">Online only</span>
          </label>
          <span className="text-[11px] text-base-content/50">
            {onlineUsers.length > 0 ? `${onlineUsers.length - 1} active` : "0 active"}
          </span>
        </div>
      </div>

      {/* Contact List */}
      <div className="overflow-y-auto w-full py-2 flex-1">
        {/* Pinned Nova AI Assistant Bot */}
        {(!searchQuery || "nova ai assistant".includes(searchQuery.toLowerCase())) && (
          <button
            onClick={() => setSelectedUser(NOVA_BOT_USER)}
            className={`
              w-full p-3 flex items-center gap-3 hover:bg-base-200 transition-colors border-b border-base-300/40
              ${selectedUser?._id === NOVA_BOT_ID ? "bg-primary/10 border-l-4 border-l-primary" : ""}
            `}
          >
            <div className="relative mx-auto lg:mx-0">
              <div className="size-11 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-primary-content shadow-sm ring-2 ring-primary/20">
                <Bot className="size-6" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 size-3.5 bg-emerald-500 rounded-full ring-2 ring-base-100 flex items-center justify-center">
                <Sparkles className="size-2 text-white" />
              </span>
            </div>

            <div className="hidden lg:block text-left min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm truncate flex items-center gap-1.5">
                  Nova AI
                  <span className="badge badge-primary badge-xs text-[9px] uppercase font-bold py-0.5">
                    Bot
                  </span>
                </span>
                <span className="text-[10px] text-primary font-medium">24/7</span>
              </div>
              <div className="text-xs text-base-content/60 truncate flex items-center gap-1">
                <span>Intelligent Chat Companion</span>
              </div>
            </div>
          </button>
        )}

        {/* Regular Users */}
        {filteredUsers.map((user) => {
          const isSelected = selectedUser?._id === user._id;
          const isOnline = onlineUsers.includes(user._id);

          return (
            <button
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`
                w-full p-3 flex items-center gap-3 hover:bg-base-200 transition-colors
                ${isSelected ? "bg-base-200 ring-1 ring-base-300" : ""}
              `}
            >
              <div className="relative mx-auto lg:mx-0">
                <img
                  src={user.profilePic || "/avatar.png"}
                  alt={user.fullName}
                  className="size-11 object-cover rounded-full border border-base-300"
                />
                {isOnline && (
                  <span
                    className="absolute bottom-0 right-0 size-3 bg-emerald-500 
                    rounded-full ring-2 ring-base-100"
                  />
                )}
              </div>

              {/* User info - only visible on larger screens */}
              <div className="hidden lg:block text-left min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm truncate">{user.fullName}</div>
                  {user.lastMessage?.createdAt && (
                    <span className="text-[10px] text-base-content/50">
                      {formatMessageTime(user.lastMessage.createdAt)}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between mt-0.5">
                  <div className="text-xs text-base-content/60 truncate max-w-[150px]">
                    {user.lastMessage ? (
                      user.lastMessage.image ? (
                        "📷 Photo"
                      ) : (
                        user.lastMessage.text || "Message"
                      )
                    ) : (
                      <span className="italic text-base-content/40">No messages yet</span>
                    )}
                  </div>

                  {user.unreadCount > 0 && (
                    <span className="badge badge-primary badge-sm text-[10px] font-bold px-1.5 py-0.5 h-4 min-w-4 rounded-full">
                      {user.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}

        {filteredUsers.length === 0 && (
          <div className="text-center text-base-content/50 py-8 text-xs px-2">
            {searchQuery ? "No contacts found" : "No online users"}
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
