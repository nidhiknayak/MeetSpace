const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Serve static files from build directory for React
app.use(express.static(path.join(__dirname, 'build')));

// Fallback to serve React app for any non-API routes
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});


// In-memory storage for rooms
const rooms = new Map();

// Helper function to generate room ID
function generateRoomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Socket connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Create a new room
  socket.on('create-room', () => {
    const roomId = generateRoomId();
    
    // Initialize room if it doesn't exist
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        id: roomId,
        users: new Map(),
        messages: []
      });
    }

    socket.emit('room-created', { roomId });
    console.log(`Room created: ${roomId}`);
  });

  // Join a room
  socket.on('join-room', ({ roomId, username }) => {
    // Check if room exists
    if (!rooms.has(roomId)) {
      socket.emit('error', { message: 'Room does not exist' });
      return;
    }

    const room = rooms.get(roomId);
    
    // Add user to room
    room.users.set(socket.id, {
      id: socket.id,
      username: username || `User-${socket.id.substring(0, 4)}`,
      joinedAt: new Date()
    });

    // Join the socket room
    socket.join(roomId);
    socket.roomId = roomId;

    // Send current room state to the new user
    socket.emit('joined-room', {
      roomId,
      users: Array.from(room.users.values()),
      messages: room.messages
    });

    // Notify other users in the room
    socket.to(roomId).emit('user-joined', {
      user: room.users.get(socket.id),
      users: Array.from(room.users.values())
    });

    console.log(`User ${username} joined room ${roomId}`);
  });

  // Handle messages
  socket.on('send-message', ({ roomId, message, username }) => {
    if (!rooms.has(roomId)) {
      socket.emit('error', { message: 'Room does not exist' });
      return;
    }

    const room = rooms.get(roomId);
    const messageData = {
      id: uuidv4(),
      username: username || `User-${socket.id.substring(0, 4)}`,
      message,
      timestamp: new Date(),
      userId: socket.id
    };

    // Store message in room
    room.messages.push(messageData);

    // Broadcast message to all users in the room
    io.to(roomId).emit('new-message', messageData);

    console.log(`Message in room ${roomId}: ${message}`);
  });

  // Handle typing indicator
  socket.on('typing', ({ roomId, username, isTyping }) => {
    socket.to(roomId).emit('user-typing', { username, isTyping });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);

    if (socket.roomId && rooms.has(socket.roomId)) {
      const room = rooms.get(socket.roomId);
      const user = room.users.get(socket.id);
      
      if (user) {
        // Remove user from room
        room.users.delete(socket.id);

        // Notify other users
        socket.to(socket.roomId).emit('user-left', {
          user,
          users: Array.from(room.users.values())
        });

        // Clean up empty rooms
        if (room.users.size === 0) {
          rooms.delete(socket.roomId);
          console.log(`Room ${socket.roomId} deleted (empty)`);
        }

        console.log(`User ${user.username} left room ${socket.roomId}`);
      }
    }
  });

  // Get room info
  socket.on('get-room-info', (roomId) => {
    if (rooms.has(roomId)) {
      const room = rooms.get(roomId);
      socket.emit('room-info', {
        exists: true,
        userCount: room.users.size
      });
    } else {
      socket.emit('room-info', { exists: false });
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} to access the meeting platform`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});