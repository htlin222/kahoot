import { Server } from 'socket.io';
import { GameService } from '../services/gameService.js';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

export function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Middleware for error handling
  io.use((socket, next) => {
    socket.on('error', (error) => {
      logger.error('Socket error:', error);
    });
    next();
  });

  // Connection handling
  io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id}`);

    // Player joining game
    socket.on('join_game', async ({ pin, name }) => {
      try {
        const isValidPin = await GameService.validatePin(pin);
        if (!isValidPin) {
          socket.emit('join_error', { message: 'Invalid game PIN' });
          return;
        }

        await GameService.addPlayer(name);
        socket.join(pin);
        socket.playerName = name;
        socket.gamePin = pin;

        // Broadcast to all players in the game
        io.to(pin).emit('player_joined', { name });
        
        // Send updated player list
        const players = await GameService.getPlayers();
        io.to(pin).emit('players_update', { players });

        socket.emit('join_success', { name });
        logger.info(`Player ${name} joined game ${pin}`);
      } catch (error) {
        socket.emit('join_error', { message: error.message });
        logger.error('Join game error:', error);
      }
    });

    // Submit answer
    socket.on('submit_answer', async ({ answer }) => {
      try {
        if (!socket.playerName || !socket.gamePin) {
          socket.emit('answer_error', { message: 'Player not properly connected' });
          return;
        }

        const result = await GameService.submitAnswer(socket.playerName, answer);
        socket.emit('answer_confirmed', result);

        // Notify teacher of answer submission
        io.to(socket.gamePin).emit('answer_received', {
          playerName: socket.playerName,
          answerTime: result.answerTime
        });
      } catch (error) {
        socket.emit('answer_error', { message: error.message });
        logger.error('Submit answer error:', error);
      }
    });

    // Teacher events
    socket.on('start_game', async ({ quizId }) => {
      try {
        const gameState = await GameService.startGame(quizId);
        const pin = await GameService.generatePin();
        socket.join(pin);
        socket.gamePin = pin;
        io.to(pin).emit('game_started', { gameState, pin });
      } catch (error) {
        socket.emit('game_error', { message: error.message });
        logger.error('Start game error:', error);
      }
    });

    socket.on('next_question', async () => {
      try {
        if (!socket.gamePin) {
          socket.emit('game_error', { message: 'No active game' });
          return;
        }

        const gameState = await GameService.nextQuestion();
        io.to(socket.gamePin).emit('question_started', { gameState });
      } catch (error) {
        socket.emit('game_error', { message: error.message });
        logger.error('Next question error:', error);
      }
    });

    socket.on('show_answer', async () => {
      try {
        if (!socket.gamePin) {
          socket.emit('game_error', { message: 'No active game' });
          return;
        }

        const gameState = await GameService.showAnswer();
        io.to(socket.gamePin).emit('answer_revealed', { gameState });
      } catch (error) {
        socket.emit('game_error', { message: error.message });
        logger.error('Show answer error:', error);
      }
    });

    socket.on('end_game', async () => {
      try {
        if (!socket.gamePin) {
          socket.emit('game_error', { message: 'No active game' });
          return;
        }

        const gameState = await GameService.finishGame();
        io.to(socket.gamePin).emit('game_ended', { gameState });
      } catch (error) {
        socket.emit('game_error', { message: error.message });
        logger.error('End game error:', error);
      }
    });

    // Disconnection handling
    socket.on('disconnect', async () => {
      try {
        if (socket.playerName) {
          await GameService.removePlayer(socket.playerName);
          if (socket.gamePin) {
            io.to(socket.gamePin).emit('player_left', { name: socket.playerName });
            const players = await GameService.getPlayers();
            io.to(socket.gamePin).emit('players_update', { players });
          }
        }
        logger.info(`Client disconnected: ${socket.id}`);
      } catch (error) {
        logger.error('Disconnect error:', error);
      }
    });
  });

  return io;
}
