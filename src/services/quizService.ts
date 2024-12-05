import { QuizSet } from '../types/quiz';

const API_URL = 'http://localhost:3002';

class QuizService {
  async fetchQuizzes(): Promise<QuizSet[]> {
    const response = await fetch(`${API_URL}/api/quizzes`);
    return response.json();
  }

  async fetchQuiz(quizId: string): Promise<QuizSet> {
    const response = await fetch(`${API_URL}/api/quiz/${quizId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch quiz');
    }
    return response.json();
  }

  async deleteQuiz(quizId: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/quiz/${quizId}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error('Failed to delete quiz');
    }
  }

  async saveQuiz(quiz: QuizSet): Promise<void> {
    const response = await fetch(`${API_URL}/api/quiz`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(quiz)
    });
    if (!response.ok) {
      throw new Error('Failed to save quiz');
    }
  }

  async exportQuiz(quizId: string): Promise<Blob> {
    const response = await fetch(`${API_URL}/api/quiz/${quizId}/export`);
    if (!response.ok) {
      throw new Error('Failed to export quiz');
    }
    return response.blob();
  }

  validateQuizStructure(quiz: any): quiz is QuizSet {
    if (!quiz || typeof quiz !== 'object') return false;
    if (!quiz.quizId || typeof quiz.quizId !== 'string') return false;
    if (!quiz.title || typeof quiz.title !== 'string') return false;
    if (!Array.isArray(quiz.questions)) return false;

    return quiz.questions.every((q: any, index: number) => {
      if (!q || typeof q !== 'object') return false;
      if (typeof q.question !== 'string') return false;
      if (!Array.isArray(q.options) || q.options.length !== 4) return false;
      if (!q.options.every((opt: any) => typeof opt === 'string')) return false;
      if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3) return false;
      if (typeof q.index !== 'number' || q.index !== index) return false;
      return true;
    });
  }
}

export const quizService = new QuizService();
