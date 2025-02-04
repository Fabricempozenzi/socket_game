const socket = io();

const loginDiv = document.getElementById("login");
const gameAreaDiv = document.getElementById("gameArea");
const playersDiv = document.getElementById("players");
const statusP = document.getElementById("status");
const guessInput = document.getElementById("guess");
const submitGuessButton = document.getElementById("submitGuess");
const joinButton = document.getElementById("join");

let playerName = "";

joinButton.addEventListener("click", () => {
  playerName = document.getElementById("name").value.trim();
  if (playerName) {
    socket.emit("joinGame", playerName);
    loginDiv.classList.add("hidden");
    gameAreaDiv.classList.remove("hidden");
  }
});

submitGuessButton.addEventListener("click", () => {
  const guess = parseInt(guessInput.value);
  if (!isNaN(guess)) {
    socket.emit("makeGuess", { guess });
    guessInput.value = "";
    submitGuessButton.disabled = true;
  }
});

socket.on("playerJoined", (players) => {
  playersDiv.innerHTML = players.map((p) => `<p>${p.name}</p>`).join("");
});

socket.on("yourTurn", () => {
  statusP.textContent = "It's your turn!";
  submitGuessButton.disabled = false;
});

socket.on("feedback", (message) => {
  statusP.textContent = message;
});

socket.on("gameOver", (data) => {
  alert(`${data.winner} won! The number was ${data.number}.`);
  location.reload();
});

socket.on("playerLeft", (players) => {
  playersDiv.innerHTML = players.map((p) => `<p>${p.name}</p>`).join("");
});
