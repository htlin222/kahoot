import { QuizSet } from '../types/quiz';

const API_BASE_URL = 'http://localhost:3002/api';

export const quizService = {
  async fetchQuizzes(): Promise<QuizSet[]> {
    const response = await fetch(`${API_BASE_URL}/quizzes`);
    if (!response.ok) throw new Error('Failed to fetch quizzes');
    return response.json();
  },

  async deleteQuiz(quizId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/quiz/${quizId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete quiz');
  },

  async saveQuiz(quiz: QuizSet): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/quiz`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(quiz),
    });
    if (!response.ok) throw new Error('Failed to save quiz');
  },

  async exportQuiz(quizId: string): Promise<QuizSet> {
    const response = await fetch(`${API_BASE_URL}/quiz/${quizId}`);
    if (!response.ok) throw new Error('Failed to fetch quiz data');
    return response.json();
  },

  validateQuizStructure(quiz: any): quiz is QuizSet {
    if (!quiz || typeof quiz !== 'object') return false;
    if (typeof quiz.title !== 'string' || !quiz.title) return false;
    if (!Array.isArray(quiz.questions) || quiz.questions.length === 0) return false;
    
    return quiz.questions.every((q: any) => {
      if (typeof q.question !== 'string' || !q.question) return false;
      if (!Array.isArray(q.options) || q.options.length !== 4) return false;
      if (!q.options.every((opt: any) => typeof opt === 'string' && opt)) return false;
      if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3) return false;
      return true;
    });
  }
};
