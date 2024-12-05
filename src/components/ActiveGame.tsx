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
    <div className="w-full max-w-7xl mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">
          Question {gameState.currentQuestionIndex + 1} of {quiz.questions.length}
        </h2>
        <h3 className="text-lg">Players: {players.length}</h3>
      </div>

      {currentQuestion && (
        <div className="space-y-8">
          <div className="text-2xl font-medium text-center">
            {currentQuestion.question}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 aspect-[2/1]">
            {currentQuestion.options.map((option, index) => (
              <div 
                key={index}
                className={`flex items-center justify-center text-lg p-4 rounded-lg transition-colors ${
                  showingAnswer && index === currentQuestion.correctAnswer
                    ? 'bg-green-500 text-black'
                    : `${OPTION_COLORS[index]} text-black`
                }`}
              >
                {option}
              </div>
            ))}
          </div>
          
          {showingAnswer && topPlayers.length > 0 && (
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Top 10 Players</h3>
              <div className="grid gap-2">
                {topPlayers.map((player) => (
                  <div 
                    key={player.name}
                    className={`flex justify-between items-center p-3 rounded-lg ${
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
            </Card>
          )}

          <div className="flex gap-4">
            {!showingAnswer && (
              <Button 
                className="flex-1 text-lg py-6"
                onClick={onShowAnswer}
              >
                Show Answer
              </Button>
            )}
            {showingAnswer && (
              <Button 
                className="flex-1 text-lg py-6"
                onClick={isLastQuestion ? onEndGame : onNextQuestion}
              >
                {isLastQuestion ? 'End Quiz' : 'Next Question'}
              </Button>
            )}
          </div>

          {!isLastQuestion && showingAnswer && (
            <Button
              variant="destructive"
              className="w-full text-lg py-6"
              onClick={onEndGame}
            >
              End Game Early
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
