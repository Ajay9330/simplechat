const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const port = process.env.PORT || 3000;

// Store online users
const onlineUsers = new Set();

app.use(express.static(__dirname)); // Serve static files from the project directory

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('join', (username) => {
    socket.username = username;
    onlineUsers.add(username);
    io.emit('updateUsers', Array.from(onlineUsers));
    console.log(`${username} joined`);
    io.emit('notification', `${username} joined the chat`);
  });

  socket.on('chat message', (msg) => {
    io.emit('chat message', { username: socket.username, message: msg });
  });

  socket.on('disconnect', () => {
    if (socket.username) {
      onlineUsers.delete(socket.username);
      io.emit('updateUsers', Array.from(onlineUsers));
      console.log(`${socket.username} disconnected`);
      io.emit('notification', `${socket.username} left the chat`);
    }
  });
});

server.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});
