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

let story = [];
let users = [];
let currentTurnIndex = 0;
let turnTimeLeft = 30;
let turnTimer;
let isEnded = false;
const BOT_ID = "bot";
const BOT_NAME = "StoryBot";
const BOT_DELAY_MS = 2000;

const botSentences = [
  "Suddenly, a mysterious shadow appeared.",
  "The wind whispered secrets...",
  "Out of nowhere, a loud crash echoed.",
  "Something stirred in a forming darkness.",
  "A sense of unease filled the air.",
  "Then, a soft glow started to pulse in the distance.",
  "An eerie calm settled over everything..",
  "A chill ran through the atmosphere.",
  "Without warning, the ground trembled.",
  "Time seemed to pause for a heartbeat.",
  "Everything felt different and somehow changed.",
  "The moment felt like the beginning of something.",
  "Somehow, it all made sense — and none of it did.",
  "It felt both too late and far too soon.",
  "The rhythm of things had changed — subtly, but surely",
  "A question lingered in the stillness, unanswered.",
  "It all seemed simple until it wasn’t.",
  "The world did not pause, but something within did.",
  "The next second felt like a lifetime.",
  "It was too late to pretend nothing had changed.",
  "Decision had to be made — quickly.",
  "Something valuable had just been lost.",
  "Something about the moment hinted at more to come.",
  "Nothing seemed wrong — yet.",
  "Just when it seemed like nothing would happen…",
  "Then came the feeling — that strange, certain sense that…",
  "No one expected what came after…",
  "And just like that, everything changed because…",
  "No one knew why a banana was there, but…",
  "Suddenly, someone yelled the following:",
  "Long pause, then the loud declaration:",
  "There was a chase then, though no one knew who was being chased until…",
  "There was absolutely no reason for the rubber duck, and yet…",
  "Someone had clearly been here before — judging by the sandwich.",
  "No one expected a pie to explode, and yet…",
  "A squirrel ran by holding something that looked like…",
  "The ground was sticky, which usually meant…",
  "A sock puppet peeked out from behind, then whispered…",
  "There was confetti, but no sign of a celebration.",
  "The fog machine went unnoticed until this point.",
];

function generateBotSentence() {
  const index = Math.floor(Math.random() * botSentences.length);
  return botSentences[index];
}

function getParticipants() {
  const participants = [...users];
  if (participants.length === 1) {
    participants.push({ id: BOT_ID, name: BOT_NAME });
  }
  return participants;
}

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
    const participants = getParticipants();
    io.emit("game_state", {
      users: participants.map((user) => user.name),
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
    if (users.length === 0) {
      clearInterval(turnTimer);
      return;
    }
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
  });

  function passTurn() {
    const participants = getParticipants();
    currentTurnIndex = (currentTurnIndex + 1) % participants.length;
    updateTurn();
  }

  function updateTurn() {
    const participants = getParticipants();
    participants.forEach((user, index) => {
      if (user.id !== BOT_ID) {
        io.to(user.id).emit("your_turn", index === currentTurnIndex);
      }
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
      users: participants.map((user) => user.name),
      currentTurnIndex,
      turnTimeLeft,
      isEnded,
    });

    const current = participants[currentTurnIndex];
    if (participants.length > 0 && !isEnded && current.id === BOT_ID) {
      setTimeout(() => {
        const text = generateBotSentence();
        story.push({ text, author: BOT_NAME });
        io.emit("story_update", story);
        passTurn();
      }, BOT_DELAY_MS);
    }
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`✅ Socket.IO server running on http://localhost:${PORT}`);
});
