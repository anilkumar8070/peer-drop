const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

// Initialize Socket.io with CORS allowed for your frontend
const io = new Server(server, {
    cors: {
        origin: "*", // In production, replace with your Vercel URL
        methods: ["GET", "POST"]
    }
});

// Store room data (Optional: for tracking room size)
const rooms = {};

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        
        // Count users in room
        const clients = io.sockets.adapter.rooms.get(roomId);
        const numClients = clients ? clients.size : 0;

        console.log(`User ${socket.id} joined room: ${roomId} (${numClients} users)`);

        // Notify others in the room that a new user has joined
        if (numClients > 1) {
            socket.to(roomId).emit('user-joined', socket.id);
        }
    });

    // Relay WebRTC signaling data (SDP and ICE candidates)
    socket.on('signal', ({ targetId, signal }) => {
        // We send the signal directly to the specific user (targetId)
        io.to(targetId).emit('signal', {
            senderId: socket.id,
            signal: signal
        });
    });

    // Handle text/clipboard sharing via Socket (Fallback/Instant)
    socket.on('send-message', ({ roomId, message }) => {
        socket.to(roomId).emit('receive-message', message);
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Signaling server running on http://localhost:${PORT}`);
});