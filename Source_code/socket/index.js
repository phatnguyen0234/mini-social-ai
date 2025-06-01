const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = socketio(8900, {
  cors: {
    origin: ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:8000", "http://127.0.0.1:8000"],
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

const PORT = process.env.PORT || 8000;

// Keep track of connected users
let users = new Map();

const addUser = (userId, socketId) => {
  users.set(userId, socketId);
};

const removeUser = (socketId) => {
  for (let [userId, id] of users.entries()) {
    if (id === socketId) {
      users.delete(userId);
      break;
    }
  }
};

const getUser = (userId) => {
  return users.get(userId);
};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Add new user
  socket.on("addUser", (userId) => {
    if (userId) {
      addUser(userId, socket.id);
      io.emit("getUsers", Array.from(users.entries()));
    }
  });

  // Handle messages
  socket.on("sendMessage", async ({ senderId, receiverId, text }) => {
    try {
      const receiverSocketId = getUser(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("getMessage", {
          senderId,
          text,
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    removeUser(socket.id);
    io.emit("getUsers", Array.from(users.entries()));
  });
});

server.listen(PORT, () => console.log(`Socket server running on port ${PORT}`));
