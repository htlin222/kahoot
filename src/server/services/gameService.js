import redisClient from '../config/redis.js';
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

const GAME_KEY = 'game:current';
const PLAYERS_KEY = 'game:players';
const PIN_EXPIRY = 60 * 60; // 1 hour

export class GameService {
  static async generatePin() {
    try {
      let currentPin = await redisClient.get(`${GAME_KEY}:pin`);
      
      if (!currentPin) {
        currentPin = Math.floor(1000 + Math.random() * 9000).toString();
        await redisClient.set(`${GAME_KEY}:pin`, currentPin, {
          EX: PIN_EXPIRY
        });
        logger.info(`New PIN generated: ${currentPin}`);
      }
      
      return currentPin;
    } catch (error) {
      logger.error('Error generating PIN:', error);
      throw error;
    }
  }

  static async validatePin(pin) {
    try {
      const currentPin = await redisClient.get(`${GAME_KEY}:pin`);
      return pin === currentPin;
    } catch (error) {
      logger.error('Error validating PIN:', error);
      throw error;
    }
  }

  static async addPlayer(name) {
    try {
      const exists = await redisClient.sIsMember(PLAYERS_KEY, name);
      if (exists) {
        return false;
      }
      
      await redisClient.sAdd(PLAYERS_KEY, name);
      logger.info(`Player joined: ${name}`);
      return true;
    } catch (error) {
      logger.error('Error adding player:', error);
      throw error;
    }
  }

  static async getPlayers() {
    try {
      return await redisClient.sMembers(PLAYERS_KEY);
    } catch (error) {
      logger.error('Error getting players:', error);
      throw error;
    }
  }

  static async startGame(quizId) {
    try {
      const gameState = {
        quizId,
        status: 'waiting',
        currentQuestionIndex: -1,
        scores: {},
        startTime: Date.now()
      };
      
      await redisClient.set(`${GAME_KEY}:state`, JSON.stringify(gameState));
      logger.info(`Game started with quiz: ${quizId}`);
      return gameState;
    } catch (error) {
      logger.error('Error starting game:', error);
      throw error;
    }
  }

  static async getGameState() {
    try {
      const state = await redisClient.get(`${GAME_KEY}:state`);
      return state ? JSON.parse(state) : null;
    } catch (error) {
      logger.error('Error getting game state:', error);
      throw error;
    }
  }

  static async showAnswer() {
    try {
      const state = await this.getGameState();
      if (!state) throw new Error('No active game');

      state.status = 'answer';
      
      // Calculate scores based on answer times
      const answers = await this.getQuestionAnswers(state.currentQuestionIndex);
      const quiz = await redisClient.get(`quiz:${state.quizId}`);
      const quizData = JSON.parse(quiz);
      const correctAnswer = quizData.questions[state.currentQuestionIndex].correctAnswer;

      // Sort answers by time and award points
      const sortedAnswers = Object.entries(answers)
        .sort(([, a], [, b]) => a.time - b.time);

      sortedAnswers.forEach(([player, data], index) => {
        if (data.answer === correctAnswer) {
          // Award points based on speed: 1000 for fastest, decreasing by 100 for each position
          const points = Math.max(1000 - (index * 100), 100);
          state.scores[player] = (state.scores[player] || 0) + points;
        }
      });

      await redisClient.set(`${GAME_KEY}:state`, JSON.stringify(state));
      logger.info('Showing answer and updating scores');
      return state;
    } catch (error) {
      logger.error('Error showing answer:', error);
      throw error;
    }
  }

  static async nextQuestion() {
    try {
      const state = await this.getGameState();
      if (!state) throw new Error('No active game');

      state.currentQuestionIndex++;
      state.status = 'question';
      state.questionStartTime = Date.now();

      await redisClient.set(`${GAME_KEY}:state`, JSON.stringify(state));
      logger.info(`Moving to question ${state.currentQuestionIndex}`);
      return state;
    } catch (error) {
      logger.error('Error moving to next question:', error);
      throw error;
    }
  }

  static async submitAnswer(playerName, answer) {
    try {
      const state = await this.getGameState();
      if (!state || state.status !== 'question') {
        throw new Error('No active question');
      }

      const answerTime = Date.now() - state.questionStartTime;
      if (!state.scores[playerName]) {
        state.scores[playerName] = 0;
      }

      // Store the answer and calculate score
      const answerKey = `${GAME_KEY}:answers:${state.currentQuestionIndex}`;
      await redisClient.hSet(answerKey, playerName, JSON.stringify({
        answer,
        time: answerTime
      }));

      await redisClient.set(`${GAME_KEY}:state`, JSON.stringify(state));
      return { answerTime };
    } catch (error) {
      logger.error('Error submitting answer:', error);
      throw error;
    }
  }

  static async getQuestionAnswers(questionIndex) {
    try {
      const answerKey = `${GAME_KEY}:answers:${questionIndex}`;
      const answers = await redisClient.hGetAll(answerKey);
      return Object.entries(answers).reduce((acc, [player, answerData]) => {
        acc[player] = JSON.parse(answerData);
        return acc;
      }, {});
    } catch (error) {
      logger.error('Error getting question answers:', error);
      throw error;
    }
  }

  static async resetGame() {
    try {
      const newPin = Math.floor(1000 + Math.random() * 9000).toString();
      const keys = await redisClient.keys(`${GAME_KEY}:*`);
      
      const pipeline = redisClient.multi();
      keys.forEach(key => pipeline.del(key));
      pipeline.del(PLAYERS_KEY);
      pipeline.set(`${GAME_KEY}:pin`, newPin, {
        EX: PIN_EXPIRY
      });
      
      await pipeline.exec();
      logger.info('Game reset with new PIN:', newPin);
      return newPin;
    } catch (error) {
      logger.error('Error resetting game:', error);
      throw error;
    }
  }

  static async healthCheck() {
    try {
      await redisClient.ping();
      return true;
    } catch (error) {
      logger.error('Health check failed:', error);
      return false;
    }
  }
}
