import cluster from 'cluster';
import { cpus } from 'os';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import asyncHandler from 'express-async-handler';
import winston from 'winston';
import { GameService } from './services/gameService.js';
import { QuizService } from './services/quizService.js';
import { connectRedis } from './config/redis.js';

const numCPUs = cpus().length;

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('API Request', {
      method: req.method,
      path: req.path,
      params: req.params,
      query: req.query,
      body: req.method !== 'GET' ? req.body : undefined,
      status: res.statusCode,
      duration: `${duration}ms`
    });
  });

  next();
};

if (cluster.isPrimary) {
  logger.info(`Primary ${process.pid} is running`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    logger.warn(`Worker ${worker.process.pid} died. Restarting...`, {
      code,
      signal
    });
    cluster.fork();
  });
} else {
  const app = express();

  // Middleware
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '10kb' }));
  app.use(requestLogger);

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  });
  app.use(limiter);

  // Connect to Redis
  connectRedis().catch(err => {
    logger.error('Failed to connect to Redis:', err);
    process.exit(1);
  });

  // Quiz Routes
  app.post('/api/quiz', asyncHandler(async (req, res) => {
    const quizData = req.body;
    if (!quizData.quizId || !quizData.title || !Array.isArray(quizData.questions)) {
      logger.warn('Invalid quiz data received', { data: quizData });
      return res.status(400).json({ 
        error: 'Invalid quiz data',
        details: 'Quiz must include quizId, title, and questions array'
      });
    }
    const quiz = await QuizService.createQuiz(quizData);
    logger.info('Quiz created successfully', { quizId: quiz.quizId });
    res.status(201).json(quiz);
  }));

  app.get('/api/quiz/:quizId', asyncHandler(async (req, res) => {
    const { quizId } = req.params;
    const quiz = await QuizService.getQuiz(quizId);
    if (!quiz) {
      logger.warn(`Quiz not found: ${quizId}`);
      return res.status(404).json({ error: 'Quiz not found' });
    }
    logger.info(`Quiz retrieved: ${quizId}`);
    res.json(quiz);
  }));

  app.get('/api/quizzes', asyncHandler(async (req, res) => {
    const quizzes = await QuizService.getAllQuizzes();
    logger.info(`Retrieved ${quizzes.length} quizzes`);
    res.json(quizzes);
  }));

  app.put('/api/quiz/:quizId', asyncHandler(async (req, res) => {
    const { quizId } = req.params;
    const quizData = req.body;
    if (!quizData.title || !Array.isArray(quizData.questions)) {
      logger.warn('Invalid quiz update data', { quizId, data: quizData });
      return res.status(400).json({ 
        error: 'Invalid quiz data',
        details: 'Quiz must include title and questions array'
      });
    }
    const quiz = await QuizService.updateQuiz(quizId, { ...quizData, quizId });
    if (!quiz) {
      logger.warn(`Quiz not found for update: ${quizId}`);
      return res.status(404).json({ error: 'Quiz not found' });
    }
    logger.info(`Quiz updated: ${quizId}`);
    res.json(quiz);
  }));

  app.delete('/api/quiz/:quizId', asyncHandler(async (req, res) => {
    const { quizId } = req.params;
    const deleted = await QuizService.deleteQuiz(quizId);
    if (!deleted) {
      logger.warn(`Quiz not found for deletion: ${quizId}`);
      return res.status(404).json({ error: 'Quiz not found' });
    }
    logger.info(`Quiz deleted: ${quizId}`);
    res.status(204).send();
  }));

  // New endpoint to clear all quizzes
  app.delete('/api/quizzes', asyncHandler(async (req, res) => {
    await QuizService.clearAllQuizzes();
    logger.info('All quizzes cleared');
    res.status(204).send();
  }));

  // Game Routes
  app.get('/api/teacher/pin', asyncHandler(async (req, res) => {
    const pin = await GameService.generatePin();
    logger.info('Game PIN generated', { pin });
    res.json({ pin });
  }));

  app.post('/api/play/join', asyncHandler(async (req, res) => {
    const { pin, name } = req.body;

    if (!pin || !name) {
      logger.warn('Invalid join request', { pin, name });
      return res.status(400).json({ error: 'PIN and name are required' });
    }

    const isValidPin = await GameService.validatePin(pin);
    if (!isValidPin) {
      logger.warn('Invalid PIN attempt', { pin });
      return res.status(400).json({ error: 'Incorrect PIN' });
    }

    const playerAdded = await GameService.addPlayer(name);
    if (!playerAdded) {
      logger.warn('Player name taken', { name });
      return res.status(400).json({ error: 'Name already taken' });
    }

    logger.info('Player joined successfully', { pin, name });
    res.json({ success: true });
  }));

  app.get('/api/teacher/players', asyncHandler(async (req, res) => {
    const players = await GameService.getPlayers();
    logger.info('Players list retrieved', { count: players.length });
    res.json({ players });
  }));

  app.post('/api/teacher/reset', asyncHandler(async (req, res) => {
    const newPin = await GameService.resetGame();
    logger.info('Game reset', { newPin });
    res.json({ success: true, pin: newPin });
  }));

  // Health check endpoint
  app.get('/health', asyncHandler(async (req, res) => {
    const healthy = await GameService.healthCheck();
    if (!healthy) {
      logger.error('Health check failed');
      return res.status(503).json({ status: 'unhealthy' });
    }
    logger.info('Health check passed');
    res.json({ status: 'healthy' });
  }));

  // Error handling middleware
  app.use((err, req, res, next) => {
    logger.error('Unhandled error:', {
      error: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method
    });
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  });

  const PORT = process.env.PORT || 3002;
  app.listen(PORT, () => {
    logger.info(`Worker ${process.pid} started on port ${PORT}`);
  });
}

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception:', {
    error: err.message,
    stack: err.stack
  });
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled rejection:', {
    error: err.message,
    stack: err.stack
  });
  process.exit(1);
});
