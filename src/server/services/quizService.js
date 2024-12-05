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
  static validateQuizData(quizData) {
    const { title, questions } = quizData;
    
    if (!title || typeof title !== 'string') {
      throw new Error('Invalid quiz title');
    }
    
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Quiz must have at least one question');
    }

    // Validate questions and ensure proper indexing
    const sortedQuestions = [...questions].sort((a, b) => a.index - b.index);
    for (let i = 0; i < sortedQuestions.length; i++) {
      const q = sortedQuestions[i];
      
      if (q.index !== i) {
        throw new Error(`Invalid question index at position ${i}`);
      }
      
      if (!q.question || typeof q.question !== 'string') {
        throw new Error(`Invalid question text at index ${i}`);
      }
      
      if (!Array.isArray(q.options) || q.options.length !== 4) {
        throw new Error(`Question at index ${i} must have exactly 4 options`);
      }
      
      if (!q.options.every(opt => typeof opt === 'string' && opt)) {
        throw new Error(`Invalid options at question index ${i}`);
      }
      
      if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3) {
        throw new Error(`Invalid correct answer at question index ${i}`);
      }
    }

    return true;
  }

  static async clearAllQuizzes() {
    try {
      logger.info('Clearing all quizzes');
      await redisClient.del('quizzes');
      logger.info('Successfully cleared all quizzes');
      return true;
    } catch (error) {
      logger.error(`Error clearing quizzes: ${error.message}`, { error });
      throw error;
    }
  }

  static async createQuiz(quizData) {
    try {
      const { quizId } = quizData;
      logger.info(`Creating quiz with ID: ${quizId}`, { data: quizData });
      
      // Validate quiz structure and indices
      this.validateQuizData(quizData);
      
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
      // Sort questions by index when retrieving
      parsedQuiz.questions.sort((a, b) => a.index - b.index);
      
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
      const parsedQuizzes = Object.values(quizzes).map(quiz => {
        const parsedQuiz = JSON.parse(quiz);
        // Sort questions by index when retrieving
        parsedQuiz.questions.sort((a, b) => a.index - b.index);
        return parsedQuiz;
      });
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
      
      // Validate quiz structure and indices
      this.validateQuizData(quizData);
      
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
