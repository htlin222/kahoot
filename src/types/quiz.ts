export interface Question {
  index: number;  // Added index field
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface QuizSet {
  quizId: string;
  title: string;
  questions: Question[];
}
