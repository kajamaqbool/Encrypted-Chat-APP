# 💬 Encrypted Chat App (AI-Powered)

A modern full-stack real-time chat application built with the **MERN stack**, **WebSockets (Socket.IO)**, **Client-Side End-to-End Encryption (AES-GCM 256-bit)**, and **Google Gemini AI**. Features instant encrypted messaging, AI smart replies, tone rewriting, conversation summaries, dedicated AI bot companion, read receipts, and cloud media storage.

> Built by **Thoufiq (Kaja Maqbool)** — Full Stack Developer

---

## 🚀 Live Demo

🌐 [View Live App](https://encrypted-chat-app-vhst.onrender.com) &nbsp;|&nbsp; 📁 [GitHub Repo](https://github.com/kajamaqbool/Encrypted-Chat-APP)

---

## ✨ Key Features

### 🔒 End-to-End Cryptography (E2EE)
- **Client-Side AES-GCM 256-bit**: Messages are encrypted locally in the browser using the native Web Crypto API before transmission.
- **Ciphertext Storage**: MongoDB Atlas only stores ciphertexts and initialization vectors (`iv`). The server never reads raw user conversations.
- **Verification Safety Fingerprints**: Interactive 16-digit safety code modal for authenticating end-to-end encryption keys.
- **Backwards-Compatible**: Graceful fallback support for legacy unencrypted messages.

### 🤖 Intelligent AI Capabilities (Google Gemini)
- **AI Smart Reply Chips**: Contextual 1-tap reply suggestions above the composer (like LinkedIn / Gmail).
- **AI Message Polisher ("✨ Tone & Grammar")**: Rewrite drafts into *Professional*, *Casual*, *Concise*, or *Grammar-corrected* text on the fly.
- **AI Conversation Summarizer**: Generates a crisp 3-bullet executive summary and key action items from any chat history.
- **Nova AI Companion Bot**: Dedicated in-app conversational assistant pinned in the sidebar for 24/7 questions, brainstorming, and assistance.

### ⚡ Real-Time Chat UX
- **Live Typing Indicators**: Real-time animated typing bubbles and status indicators.
- **Read & Delivery Receipts**: WhatsApp-style status checkmarks (✓ sent, ✓✓ delivered, ✓✓ blue/seen).
- **Sidebar Contact Search**: Live search and filter contacts by name or email.
- **Last Message Previews & Unread Badges**: Real-time unread message counter badges and snippets.
- **Online Presence**: Instant online/offline status tracking with green indicators.
- **Image Sharing**: Upload and send images via Cloudinary.
- **Theme Customization**: 32 DaisyUI themes with real-time switching.

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI library |
| Vite | High-performance bundler & dev server |
| Web Crypto API | Client-side AES-GCM 256-bit cryptography |
| Zustand | Global state management |
| Socket.IO Client | Real-time WebSocket connection |
| TailwindCSS + DaisyUI | Styling & responsive theme components |
| Lucide React | Modern icons |
| Axios | HTTP requests |
| React Router v6 | Client-side routing |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| Google Gemini API | LLM for Smart Replies, Polishing & Nova AI |
| Socket.IO | Real-time bidirectional WebSockets |
| MongoDB Atlas + Mongoose | Database & ODM |
| JWT + HTTP-Only Cookies | Secure authentication |
| Cloudinary | Cloud-based media storage |
| bcryptjs | Password hashing |

---

## 📁 Project Structure

```
Encrypted Chat APP/
├── backend/
│   └── src/
│       ├── controllers/    # Route handlers (auth, message, ai)
│       ├── middleware/     # Auth middleware (JWT)
│       ├── models/         # Mongoose schemas (User, Message with iv/status)
│       ├── routes/         # Express routes (auth, message, ai)
│       ├── lib/            # DB, Cloudinary, Socket setup
│       └── index.js        # Express app entry point
├── frontend/
│   └── src/
│       ├── components/     # UI components (SmartReplies, Polish, Security modal)
│       ├── lib/            # Crypto (AES-GCM), Axios, utils
│       ├── pages/          # Home, Login, Signup, Profile, Settings
│       ├── store/          # Zustand stores (useAuthStore, useChatStore, useAiStore)
│       └── index.css       # Tailwind entry
└── package.json            # Root build & start scripts
```

---

## ⚙️ Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/kajamaqbool/Encrypted-Chat-APP.git
cd Encrypted-Chat-APP
```

### 2. Set up environment variables

Create a `.env` file inside the `backend/` folder:

```env
MONGODB_URI=your_mongodb_atlas_connection_string
PORT=5001
JWT_SECRET=your_jwt_secret_key

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Optional: Google Gemini API Key for AI features (Free from Google AI Studio)
GEMINI_API_KEY=your_gemini_api_key

NODE_ENV=development
```

### 3. Install dependencies & run

```bash
# Terminal 1 — Start backend
cd backend && npm install && npm run dev

# Terminal 2 — Start frontend
cd frontend && npm install && npm run dev
```

Frontend runs at: `http://localhost:5173`  
Backend runs at: `http://localhost:5001`

---

## 🏗️ Build for Production

```bash
# From root directory
npm run build   # builds frontend into /frontend/dist
npm start       # backend serves the built frontend
```

---

## 👤 Author

**Kaja Maqbool (Thoufiq)**  
Full Stack Developer  
🔗 [GitHub](https://github.com/kajamaqbool)  
📁 [This Repository](https://github.com/kajamaqbool/Encrypted-Chat-APP)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
