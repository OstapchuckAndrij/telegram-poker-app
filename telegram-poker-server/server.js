const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }, // Для разработки
});

io.on("connection", (socket) => {
  console.log("Пользователь подключился:", socket.id);

  // Присоединение к комнате (покерному столу)
  socket.on("join_table", (tableId) => {
    socket.join(tableId);
    console.log(`Игрок ${socket.id} зашел за стол ${tableId}`);
  });

  // Передача данных о карте от дилера конкретному игроку
  socket.on("send_card", ({ tableId, playerId, card }) => {
    io.to(playerId).emit("receive_card", card);
  });

  socket.on("disconnect", () => {
    console.log("Пользователь отключился");
  });
});

server.listen(3001, () => console.log("Server running on port 3001"));
