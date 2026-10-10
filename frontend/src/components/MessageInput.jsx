import { useRef, useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import SmartReplies from "./SmartReplies";
import AiPolishModal from "./AiPolishModal";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [isPolishModalOpen, setIsPolishModalOpen] = useState(false);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const { sendMessage, sendTyping, sendStopTyping, selectedUser } = useChatStore();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleTextChange = (e) => {
    setText(e.target.value);

    // Emit real-time typing events
    sendTyping();
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      sendStopTyping();
    }, 1500);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    sendStopTyping();

    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
      });

      // Clear form
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  return (
    <div className="p-3 sm:p-4 w-full bg-base-100/60 backdrop-blur-sm border-t border-base-300">
      {/* AI Smart Replies Suggestions */}
      <SmartReplies onSelectReply={(reply) => setText(reply)} />

      {imagePreview && (
        <div className="mb-3 flex items-center gap-2 px-1">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-base-300"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center hover:bg-error hover:text-white transition-colors"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 relative">
          <input
            type="text"
            className="w-full input input-bordered rounded-xl input-sm sm:input-md pr-10"
            placeholder={
              selectedUser?._id === "nova_ai_assistant_bot_id"
                ? "Ask Nova AI anything..."
                : "Type an encrypted message..."
            }
            value={text}
            onChange={handleTextChange}
          />

          {/* AI Polish Button */}
          {text.trim().length > 3 && (
            <button
              type="button"
              onClick={() => setIsPolishModalOpen(true)}
              className="absolute right-2 sm:right-3 p-1 rounded-lg text-primary hover:bg-primary/10 transition-colors"
              title="Polish tone with AI"
            >
              <Sparkles className="size-4 animate-pulse" />
            </button>
          )}

          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />
        </div>

        {/* Image Attachment Button */}
        <button
          type="button"
          className={`btn btn-circle btn-sm sm:btn-md ${
            imagePreview ? "text-primary border-primary" : "btn-ghost text-base-content/60"
          }`}
          onClick={() => fileInputRef.current?.click()}
          title="Attach image"
        >
          <Image size={18} />
        </button>

        {/* Send Button */}
        <button
          type="submit"
          className="btn btn-primary btn-circle btn-sm sm:btn-md"
          disabled={!text.trim() && !imagePreview}
          title="Send message"
        >
          <Send size={18} />
        </button>
      </form>

      {/* AI Tone Polish Modal */}
      <AiPolishModal
        isOpen={isPolishModalOpen}
        onClose={() => setIsPolishModalOpen(false)}
        currentDraft={text}
        onApplyPolished={(newDraft) => setText(newDraft)}
      />
    </div>
  );
};

export default MessageInput;
