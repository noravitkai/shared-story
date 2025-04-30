# Lined

A collaborative, turn-based story writing web app built with **Next.js**, **Express**, and **WebSockets**. Users take turns writing stories together in real-time.

## Features

- Real-time collaboration via WebSockets
- User entry with display name
- A turn-based system with visible turn indicators
- Turn timer
- Character limit per turn
- Live story preview
- Option to start over

---

## Tech Stack

### Frontend

- **Next.js 14 (App Router)**
- **React + TypeScript**
- **Tailwind CSS**
- **Socket.IO Client**

### Backend

- **Express.js**
- **Socket.IO Server**
- **ESM Modules**

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/shared-story.git
cd shared-story
```

### 2. Start the backend server

```bash
cd backend
npm install
npm run dev
```

By default, the server runs on `http://localhost:3001`.

### 3. Start the frontend

```bash
cd ../frontend
npm install
npm run dev
```

Launch the app by visiting `http://localhost:3000`.

---

## Configuration

This project uses a `.env.local` file in the `frontend` folder to store backend URLs for development and production.

---

## Dependencies

### Frontend

- `next`
- `react`, `react-dom`
- `socket.io-client`
- `tailwindcss`
- `typescript`

### Backend

- `express`
- `socket.io`
- `cors`
- `typescript`

---

## Contributors

Built by [Nóra Vitkai](https://github.com/noravitkai) and [Simon Jobbágy](https://github.com/goulashsup) as a fun little project as part of the Web Technologies 2025 course at [EASV](https://www.easv.dk/).
