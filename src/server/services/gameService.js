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

  static async resetGame() {
    try {
      const newPin = Math.floor(1000 + Math.random() * 9000).toString();
      await Promise.all([
        redisClient.set(`${GAME_KEY}:pin`, newPin, {
          EX: PIN_EXPIRY
        }),
        redisClient.del(PLAYERS_KEY)
      ]);
      
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
