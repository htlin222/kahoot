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

export class QuizService {
  static async createQuiz(quizData) {
    try {
      const { quizId } = quizData;
      logger.info(`Creating quiz with ID: ${quizId}`, { data: quizData });
      
      await redisClient.hSet('quizzes', quizId, JSON.stringify(quizData));
      logger.info(`Successfully created quiz: ${quizId}`);
      return quizData;
    } catch (error) {
      logger.error(`Error creating quiz: ${error.message}`, { error });
      throw error;
    }
  }

  static async getQuiz(quizId) {
    try {
      logger.info(`Fetching quiz with ID: ${quizId}`);
      const quizData = await redisClient.hGet('quizzes', quizId);
      
      if (!quizData) {
        logger.warn(`Quiz not found: ${quizId}`);
        return null;
      }

      const parsedQuiz = JSON.parse(quizData);
      logger.info(`Successfully retrieved quiz: ${quizId}`, { data: parsedQuiz });
      return parsedQuiz;
    } catch (error) {
      logger.error(`Error fetching quiz: ${error.message}`, { error });
      throw error;
    }
  }

  static async getAllQuizzes() {
    try {
      logger.info('Fetching all quizzes');
      const quizzes = await redisClient.hGetAll('quizzes');
      const parsedQuizzes = Object.values(quizzes).map(quiz => JSON.parse(quiz));
      logger.info(`Successfully retrieved ${parsedQuizzes.length} quizzes`);
      return parsedQuizzes;
    } catch (error) {
      logger.error(`Error fetching all quizzes: ${error.message}`, { error });
      throw error;
    }
  }

  static async updateQuiz(quizId, quizData) {
    try {
      logger.info(`Updating quiz with ID: ${quizId}`, { data: quizData });
      
      const exists = await redisClient.hExists('quizzes', quizId);
      if (!exists) {
        logger.warn(`Quiz not found for update: ${quizId}`);
        return null;
      }
      
      await redisClient.hSet('quizzes', quizId, JSON.stringify(quizData));
      logger.info(`Successfully updated quiz: ${quizId}`);
      return quizData;
    } catch (error) {
      logger.error(`Error updating quiz: ${error.message}`, { error });
      throw error;
    }
  }

  static async deleteQuiz(quizId) {
    try {
      logger.info(`Deleting quiz with ID: ${quizId}`);
      const deleted = await redisClient.hDel('quizzes', quizId);
      
      if (deleted > 0) {
        logger.info(`Successfully deleted quiz: ${quizId}`);
        return true;
      } else {
        logger.warn(`Quiz not found for deletion: ${quizId}`);
        return false;
      }
    } catch (error) {
      logger.error(`Error deleting quiz: ${error.message}`, { error });
      throw error;
    }
  }
}
