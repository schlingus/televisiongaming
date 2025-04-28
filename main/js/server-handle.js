const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// Store connected players
let players = {};

// Serve static files (like HTML, CSS, JS)
app.use(express.static('public'));

// Handle socket connections
io.on('connection', (socket) => {
    console.log('A player connected:', socket.id);

    // Add new player to the players object
    players[socket.id] = {
        id: socket.id,
        x: Math.random() * 100, // Random initial position
        y: Math.random() * 100,
    };

    // Notify all clients about the new player
    io.emit('playerConnected', players[socket.id]);

    // Handle player movement
    socket.on('move', (data) => {
        if (players[socket.id]) {
            players[socket.id].x += data.x;
            players[socket.id].y += data.y;

            // Broadcast the updated position to all clients
            io.emit('playerMoved', players[socket.id]);
        }
    });

    // Handle player disconnection
    socket.on('disconnect', () => {
        console.log('A player disconnected:', socket.id);
        delete players[socket.id];

        // Notify all clients about the player disconnection
        io.emit('playerDisconnected', socket.id);
    });
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
