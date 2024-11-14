// server.ts

import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import fightParamsRawSubmitsRoute from './routes/fightParamsRawSubmits';
import cors from 'cors';
import * as dotenv from 'dotenv';

// Import the HTTP module and Socket.IO
import http from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

// Load environment variables
dotenv.config({ path: './.env' });

const app = express();
app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/fight-params-raw-submits', fightParamsRawSubmitsRoute);

// Connect to MongoDB
const mongoConnection = process.env.DB_CONNECTION || 'nonefound';
mongoose.connect(mongoConnection);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.get('/', (req, res) => {
  res.send('boss-game-api');
});

// Create an HTTP server and integrate Socket.IO
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*', // Adjust this to your frontend's origin if needed
    methods: ['GET', 'POST'],
  },
});

// Type definitions for enhanced Socket with custom properties
interface GameSocket extends Socket {
  playerId?: string;
}

// In-memory storage for matchmaking and games
const waitingPlayers: GameSocket[] = []; // Queue for players waiting to be matched
const games: { [key: string]: { players: GameSocket[] } } = {}; // Store active games

// Handle Socket.IO connections
io.on('connection', (socket: GameSocket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle 'joinGame' event for matchmaking
  socket.on('joinGame', (data: { playerId: string }) => {
    const playerId = data.playerId;
    socket.playerId = playerId;

    console.log(`Player joined: ${playerId}`);

    // Check if there's a player waiting to be matched
    if (waitingPlayers.length > 0) {
      const opponentSocket = waitingPlayers.shift()!;
      const roomName = `room_${opponentSocket.id}_${socket.id}`;

      // Join both sockets to the same room
      socket.join(roomName);
      opponentSocket.join(roomName);

      // Save the game state
      games[roomName] = {
        players: [socket, opponentSocket],
      };

      // Notify both players that the game has started
      socket.emit('gameStart', {
        isHost: false,
        otherPlayerId: opponentSocket.playerId,
      });

      opponentSocket.emit('gameStart', {
        isHost: true,
        otherPlayerId: socket.playerId,
      });

      console.log(
        `Game started between ${socket.playerId} and ${opponentSocket.playerId} in room ${roomName}`
      );
    } else {
      // No waiting player, add this socket to the queue
      waitingPlayers.push(socket);
      console.log(`Player ${playerId} is waiting for an opponent...`);
    }
  });

  // Handle 'playerMove' event and broadcast to room
  socket.on('playerMove', (data: any) => {
    const roomName = getRoomName(socket);
    if (roomName) {
      // Broadcast to other players in the same room
      socket.to(roomName).emit('playerMoved', data);
    }
  });

  // Handle 'bossStateUpdate' event
  socket.on('bossStateUpdate', (data: any) => {
    const roomName = getRoomName(socket);
    if (roomName) {
      socket.to(roomName).emit('bossStateUpdate', data);
    }
  });

  // Handle 'dangerCircleSpawn' event
  socket.on('dangerCircleSpawn', (data: any) => {
    const roomName = getRoomName(socket);
    if (roomName) {
      socket.to(roomName).emit('dangerCircleSpawn', data);
    }
  });

  // Handle player disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);

    // Remove from waitingPlayers if in queue
    const index = waitingPlayers.indexOf(socket);
    if (index !== -1) {
      waitingPlayers.splice(index, 1);
    }

    // Remove from games if in a game
    const roomName = getRoomName(socket);
    if (roomName && games[roomName]) {
      // Notify other player in the room
      socket.to(roomName).emit('playerDisconnected', { playerId: socket.playerId });

      // Clean up the game
      delete games[roomName];
    }
  });
});

// Helper function to get the room name the socket is in
function getRoomName(socket: Socket): string | null {
  const rooms = Array.from(socket.rooms).filter((item) => item !== socket.id);
  return rooms.length > 0 ? rooms[0] : null;
}

const port = process.env.PORT || 3420;
server.listen(port, () => {
  console.log(`*****Server started on port ${port}*****`);
});
