import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Story game state
let story = [];
let users = [];
let currentTurnIndex = 0;
let turnTimeLeft = 30;
let turnTimer;
let isEnded = false;

// Socket.io logic
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (name) => {
    const trimmedName = String(name).trim();
    const MIN_LENGTH = 3;
    const MAX_LENGTH = 20;

    if (trimmedName.length < MIN_LENGTH || trimmedName.length > MAX_LENGTH) {
      return;
    }

    users.push({ id: socket.id, name: trimmedName });

    if (users.length === 1) {
      updateTurn();
    }

    socket.emit("story_update", story);
    socket.emit("your_turn", users.length - 1 === currentTurnIndex);

    io.emit("game_state", {
      users: users.map((user) => user.name),
      currentTurnIndex,
      turnTimeLeft,
      isEnded,
    });
  });

  socket.on("new_sentence", (sentence) => {
    const MAX_CHARACTERS = 75;
    const trimmed = String(sentence).trim();

    if (
      isEnded ||
      socket.id !== users[currentTurnIndex]?.id ||
      typeof trimmed !== "string" ||
      trimmed.length > MAX_CHARACTERS
    ) {
      return;
    }

    const author = users[currentTurnIndex].name;
    story.push({ text: trimmed, author });
    io.emit("story_update", story);

    if (trimmed === "/THE END") {
      isEnded = true;
      clearInterval(turnTimer);
      io.emit("game_state", {
        users: users.map((user) => user.name),
        currentTurnIndex,
        turnTimeLeft,
        isEnded,
      });
    } else {
      passTurn();
    }
  });

  socket.on("reset_game", () => {
    story = [];
    currentTurnIndex = 0;
    turnTimeLeft = 30;
    isEnded = false;
    updateTurn();
    io.emit("story_update", story);
    io.emit("game_state", {
      users: users.map((user) => user.name),
      currentTurnIndex,
      turnTimeLeft,
      isEnded,
    });
  });

  socket.on("disconnect", () => {
    users = users.filter((user) => user.id !== socket.id);
    if (currentTurnIndex >= users.length) {
      currentTurnIndex = 0;
    }
    updateTurn();
    io.emit("game_state", {
      users: users.map((user) => user.name),
      currentTurnIndex,
      turnTimeLeft,
      isEnded,
    });

    if (users.length === 0) {
      clearInterval(turnTimer);
    }
  });

  function passTurn() {
    currentTurnIndex = (currentTurnIndex + 1) % users.length;
    updateTurn();
  }

  function updateTurn() {
    users.forEach((user, index) => {
      io.to(user.id).emit("your_turn", index === currentTurnIndex);
    });

    clearInterval(turnTimer);
    turnTimeLeft = 30;
    io.emit("timer_tick", turnTimeLeft);

    turnTimer = setInterval(() => {
      turnTimeLeft--;
      io.emit("timer_tick", turnTimeLeft);

      if (turnTimeLeft <= 0) {
        passTurn();
      }
    }, 1000);

    io.emit("game_state", {
      users: users.map((user) => user.name),
      currentTurnIndex,
      turnTimeLeft,
      isEnded,
    });
  }
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`✅ Socket.IO server running on http://localhost:${PORT}`);
});
