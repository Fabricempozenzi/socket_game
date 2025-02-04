const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://socket-game-wild-snow-30.fly.dev",
    methods: ["GET", "POST"]
  }
});

const PORT = 3000;

// Serve static files
app.use(express.static("public"));
app.use(cors());

// Game state
let players = [];
let numberToGuess = Math.floor(Math.random() * 100) + 1;
let currentTurn = 0;

// When a client connects
io.on("connection", (socket) => {
  console.log("A player connected:", socket.id);

  socket.on("joinGame", (name) => {
    if (players.length < 4) {
      players.push({ id: socket.id, name });
      io.emit("playerJoined", players);

      if (players.length === 1) {
        io.to(players[0].id).emit("yourTurn");
      }
    } else {
      socket.emit("gameFull");
    }
  });

  socket.on("makeGuess", (data) => {
    const { guess } = data;
    const player = players[currentTurn];
    if (player.id === socket.id) {
      if (guess == numberToGuess) {
        io.emit("gameOver", { winner: player.name, number: numberToGuess });
      } else {
        socket.emit("feedback", guess < numberToGuess ? "Too low!" : "Too high!");
        currentTurn = (currentTurn + 1) % players.length;
        io.to(players[currentTurn].id).emit("yourTurn");
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("A player disconnected:", socket.id);
    players = players.filter((player) => player.id !== socket.id);
    io.emit("playerLeft", players);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});