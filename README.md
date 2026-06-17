# 💬 Encrypted Chat App

A full-stack real-time chat application built with the **MERN stack**, **Socket.IO**, and **JWT authentication**. Features instant messaging, image sharing, online presence tracking, and cloud-based media storage — all deployed on the cloud.

> Built by **Thoufiq** — Full Stack Developer

---

## 🚀 Live Demo

🌐 [View Live App](https://encrypted-chat-app.onrender.com) &nbsp;|&nbsp; 📁 [GitHub Repo](https://github.com/kajamaqbool/Encrypted-Chat-APP)

---

## ✨ Features

- 🔐 **Authentication & Authorization** — Secure signup/login with JWT stored in HTTP-only cookies
- ⚡ **Real-time Messaging** — Instant message delivery using Socket.IO WebSockets
- 🟢 **Online User Status** — See who's currently active in real time
- 🖼️ **Image Sharing** — Upload and send images via Cloudinary
- 🌓 **Theme Support** — Multiple UI themes powered by DaisyUI
- 🗂️ **Global State Management** — Clean state handling with Zustand
- 🛡️ **Protected Routes** — JWT middleware guards all private API endpoints
- 📱 **Responsive Design** — Works on desktop and mobile
- 🔥 **Error Handling** — Graceful error handling on both client and server

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI library |
| Vite | Build tool & dev server |
| Zustand | Global state management |
| Socket.IO Client | Real-time WebSocket connection |
| TailwindCSS + DaisyUI | Styling & UI components |
| Axios | HTTP requests |
| React Router v6 | Client-side routing |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| Socket.IO | Real-time bidirectional communication |
| MongoDB + Mongoose | Database & ODM |
| JWT | Authentication tokens |
| Cloudinary | Image upload & storage |
| bcryptjs | Password hashing |
| cookie-parser | HTTP cookie handling |

---

## 📁 Project Structure

```
Encrypted Chat APP/
├── backend/
│   └── src/
│       ├── controllers/    # Route handler logic
│       ├── middleware/     # Auth middleware (JWT)
│       ├── models/         # Mongoose schemas (User, Message)
│       ├── routes/         # API routes
│       ├── lib/            # DB, Cloudinary, Socket setup
│       └── index.js        # Express app entry point
├── frontend/
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── pages/          # Page-level components
│       ├── store/          # Zustand state stores
│       └── lib/            # Axios instance & utilities
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

NODE_ENV=development
```

### 3. Install dependencies & run

```bash
# Install all dependencies and start frontend + backend
cd backend && npm install
cd ../frontend && npm install

# Terminal 1 — Start backend
cd backend && npm start

# Terminal 2 — Start frontend
cd frontend && npm run dev
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

## 🌐 Deployment

This app is deployed on **Render** as a single service.  
The Express backend serves the React frontend in production mode.

**Environment:** Set all `.env` variables in Render's dashboard.  
**MongoDB:** Allow all IPs (`0.0.0.0/0`) in MongoDB Atlas Network Access.

---

## 👤 Author

**Kaja Maqbool (Thoufiq)**  
Full Stack Developer  
🔗 [GitHub](https://github.com/kajamaqbool)  
📁 [This Repository](https://github.com/kajamaqbool/Encrypted-Chat-APP)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
