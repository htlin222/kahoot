export interface Question {
  index: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface QuizSet {
  quizId: string;
  title: string;
  questions: Question[];
}

export interface GameState {
  quizId: string;
  status: 'waiting' | 'question' | 'answer' | 'finished';
  currentQuestionIndex: number;
  scores: Record<string, number>;
  startTime: number;
  questionStartTime?: number;
}

export interface PlayerAnswer {
  answer: number;
  time: number;
}

export interface GameScores {
  [playerName: string]: number;
}
