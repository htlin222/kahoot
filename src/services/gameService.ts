import { QuizSet } from '../types/quiz';

const API_URL = 'http://localhost:3002';

export interface GameState {
  status: 'waiting' | 'question' | 'answer';
  currentQuestionIndex: number;
  quizId: string;
  scores: Record<string, number>;
}

export interface GameSession {
  pin: string;
  players: string[];
  gameState: GameState | null;
}

class GameService {
  async getPin(): Promise<string> {
    const response = await fetch(`${API_URL}/api/teacher/pin`);
    const data = await response.json();
    return data.pin;
  }

  async getPlayers(): Promise<string[]> {
    const response = await fetch(`${API_URL}/api/teacher/players`);
    const data = await response.json();
    return data.players;
  }

  async startGame(quizId: string): Promise<GameState> {
    const response = await fetch(`${API_URL}/api/teacher/start-game`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quizId })
    });
    return response.json();
  }

  async getGameState(): Promise<GameState> {
    const response = await fetch(`${API_URL}/api/game/state`);
    return response.json();
  }

  async showAnswer(): Promise<GameState> {
    const response = await fetch(`${API_URL}/api/teacher/show-answer`, {
      method: 'POST'
    });
    return response.json();
  }

  async nextQuestion(): Promise<GameState> {
    const response = await fetch(`${API_URL}/api/teacher/next-question`, {
      method: 'POST'
    });
    return response.json();
  }

  async resetGame(): Promise<{ success: boolean; pin: string }> {
    const response = await fetch(`${API_URL}/api/teacher/reset`, {
      method: 'POST'
    });
    return response.json();
  }
}

export const gameService = new GameService();
