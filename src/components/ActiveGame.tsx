import { Button } from './ui/button';
import { Card } from './ui/card';
import { QuizSet } from '../types/quiz';
import { GameState } from '../services/gameService';

interface ActiveGameProps {
  gameState: GameState;
  quiz: QuizSet;
  players: string[];
  onNextQuestion: () => void;
  onEndGame: () => void;
  onShowAnswer: () => void;
}

export function ActiveGame({ 
  gameState, 
  quiz, 
  players, 
  onNextQuestion, 
  onEndGame,
  onShowAnswer
}: ActiveGameProps) {
  const currentQuestion = quiz.questions[gameState.currentQuestionIndex];
  const isLastQuestion = gameState.currentQuestionIndex >= quiz.questions.length - 1;
  const showingAnswer = gameState.status === 'answer';

  return (
    <div className="space-y-8 w-full max-w-md">
      <div className="text-right mb-4">
        <h3 className="text-lg font-semibold">Players: {players.length}</h3>
      </div>

      {currentQuestion && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            Question {gameState.currentQuestionIndex + 1} of {quiz.questions.length}
          </h2>
          <p className="mb-4">{currentQuestion.question}</p>
          <div className="space-y-2">
            {currentQuestion.options.map((option, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg ${
                  showingAnswer && index === currentQuestion.correctAnswer
                    ? 'bg-green-100 border-green-500'
                    : 'bg-gray-100'
                }`}
              >
                {option}
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-4">
            {!showingAnswer && (
              <Button 
                className="flex-1"
                onClick={onShowAnswer}
              >
                Show Answer
              </Button>
            )}
            {showingAnswer && (
              <Button 
                className="flex-1"
                onClick={onNextQuestion}
                disabled={isLastQuestion}
              >
                {isLastQuestion ? 'End Quiz' : 'Next Question'}
              </Button>
            )}
          </div>
        </Card>
      )}

      <Button
        variant="destructive"
        className="w-full"
        onClick={onEndGame}
      >
        End Game
      </Button>
    </div>
  );
}
