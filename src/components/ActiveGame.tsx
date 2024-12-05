import { Button } from './ui/button';
import { Card } from './ui/card';
import { QuizSet } from '../types/quiz';
import { GameState } from '../services/gameService';
import { OPTION_COLORS } from '../lib/constants';

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

  // Get top 10 players sorted by score
  const topPlayers = Object.entries(gameState.scores)
    .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
    .slice(0, 10)
    .map(([name, score], index) => ({
      rank: index + 1,
      name,
      score
    }));

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
                className={`p-3 rounded-lg transition-colors ${
                  showingAnswer && index === currentQuestion.correctAnswer
                    ? 'bg-green-500 text-white'
                    : OPTION_COLORS[index]
                }`}
              >
                {option}
              </div>
            ))}
          </div>
          
          {showingAnswer && topPlayers.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Top 10 Players</h3>
              <div className="space-y-2">
                {topPlayers.map((player) => (
                  <div 
                    key={player.name}
                    className={`flex justify-between items-center p-2 rounded-lg ${
                      player.rank === 1 ? 'bg-yellow-100' :
                      player.rank === 2 ? 'bg-gray-100' :
                      player.rank === 3 ? 'bg-orange-100' :
                      'bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold w-8">{player.rank}.</span>
                      <span>{player.name}</span>
                    </div>
                    <span className="font-semibold">{player.score}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

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
                onClick={isLastQuestion ? onEndGame : onNextQuestion}
              >
                {isLastQuestion ? 'End Quiz' : 'Next Question'}
              </Button>
            )}
          </div>
        </Card>
      )}

      {!isLastQuestion && (
        <Button
          variant="destructive"
          className="w-full"
          onClick={onEndGame}
        >
          End Game
        </Button>
      )}
    </div>
  );
}
