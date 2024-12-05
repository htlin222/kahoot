export interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface QuizSet {
  quizId: string;
  title: string;
  questions: Question[];
}
