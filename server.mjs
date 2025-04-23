import express from "express";
import next from "next";
import http from "http";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

let story = [];
let users = [];
let currentTurnIndex = 0;

nextApp.prepare().then(() => {
  const app = express();
  const server = http.createServer(app);
  const io = new Server(server);

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join", (name) => {
      users.push({ id: socket.id, name });
      updateTurn();
    });

    socket.emit("story_update", story);
    updateTurn();

    socket.on("new_sentence", (sentence) => {
      if (socket.id === users[currentTurnIndex]?.id) {
        story.push(sentence);
        io.emit("story_update", story);
        passTurn();
      }
    });

    socket.on("disconnect", () => {
      users = users.filter((user) => user.id !== socket.id);
      if (currentTurnIndex >= users.length) {
        currentTurnIndex = 0;
      }
      updateTurn();
    });

    function passTurn() {
      currentTurnIndex = (currentTurnIndex + 1) % users.length;
      updateTurn();
    }

    function updateTurn() {
      users.forEach((user, index) => {
        io.to(user.id).emit("your_turn", index === currentTurnIndex);
      });
    }
  });

  app.use((req, res) => handle(req, res));

  server.listen(3000, () => {
    console.log("✅ Server running on http://localhost:3000");
  });
});
