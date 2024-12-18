import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { useToast } from './ui/use-toast';
import { gameService, GameState } from '../services/gameService';
import { GameResults } from './GameResults';
import { OPTION_COLORS, OPTION_SELECTED_COLORS } from '../lib/constants';
import { QuizSet } from '../types/quiz';
import { quizService } from '../services/quizService';

export function PlayView() {
  const [pin, setPin] = useState('');
  const [name, setName] = useState('');
  const [joined, setJoined] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<QuizSet | null>(null);
  const [lastQuestionIndex, setLastQuestionIndex] = useState<number>(-1);
  const { toast } = useToast();

  // Get PIN from URL on mount
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const pinFromUrl = searchParams.get('pin');
    if (pinFromUrl) {
      setPin(pinFromUrl);
    }
  }, []);

  // Handle disconnection on unmount
  useEffect(() => {
    return () => {
      if (joined && name) {
        gameService.disconnect(name).catch(console.error);
      }
    };
  }, [joined, name]);

  useEffect(() => {
    if (!joined || !gameState?.quizId) return;

    const fetchQuiz = async () => {
      try {
        const quiz = await quizService.fetchQuiz(gameState.quizId);
        setCurrentQuiz(quiz);
      } catch (error) {
        console.error('Error fetching quiz:', error);
      }
    };

    fetchQuiz();
  }, [joined, gameState?.quizId]);

  useEffect(() => {
    if (!joined) return;

    const interval = setInterval(async () => {
      try {
        const state = await gameService.getGameState();
        
        // If game is finished or state is null, clear interval and reset game
        if (!state || state.status === 'finished') {
          clearInterval(interval);
          if (state?.status === 'finished') {
            setGameState(state); // Set final state for results display
          } else {
            handleFinish(); // Reset game if state is null (game was reset)
          }
          return;
        }

        setGameState(state);
        
        // Reset states when moving to a new question
        if (state?.currentQuestionIndex !== lastQuestionIndex) {
          setAnswerSubmitted(false);
          setSelectedAnswer(null);
          setLastQuestionIndex(state?.currentQuestionIndex ?? -1);
        }
      } catch (error) {
        console.error('Error fetching game state:', error);
        // If we get a 404, the game might have been reset
        if (error instanceof Error && error.message.includes('404')) {
          clearInterval(interval);
          handleFinish();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [joined, lastQuestionIndex]);

  const handleJoin = async () => {
    if (!pin || !name) {
      toast({
        title: 'Error',
        description: 'Please enter both PIN and name',
        variant: 'destructive'
      });
      return;
    }

    try {
      await gameService.joinGame(pin, name);
      setJoined(true);
      toast({
        title: 'Success',
        description: 'Successfully joined the game!'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to join game',
        variant: 'destructive'
      });
    }
  };

  const handleAnswerSubmit = async (answer: number) => {
    if (!gameState || answerSubmitted) return;

    try {
      await gameService.submitAnswer(name, answer);
      setSelectedAnswer(answer);
      setAnswerSubmitted(true);
      toast({
        title: 'Success',
        description: 'Answer submitted!'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit answer',
        variant: 'destructive'
      });
    }
  };

  const handleFinish = async () => {
    if (joined && name) {
      try {
        await gameService.disconnect(name);
      } catch (error) {
        console.error('Error disconnecting:', error);
      }
    }
    setJoined(false);
    setPin('');
    setName('');
    setGameState(null);
    setSelectedAnswer(null);
    setAnswerSubmitted(false);
    setCurrentQuiz(null);
    setLastQuestionIndex(-1);
  };

  const getCurrentRank = () => {
    if (!gameState?.scores || !name) return null;

    const sortedPlayers = Object.entries(gameState.scores)
      .sort(([, scoreA], [, scoreB]) => scoreB - scoreA);
    
    const rank = sortedPlayers.findIndex(([player]) => player === name) + 1;
    const totalPlayers = sortedPlayers.length;
    const score = gameState.scores[name] || 0;

    return { rank, totalPlayers, score };
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and limit to 8 digits
    if (/^\d*$/.test(value) && value.length <= 8) {
      setPin(value);
    }
  };

  if (!joined) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto pt-8">
          <Card className="p-6 space-y-4">
            <h1 className="text-4xl font-bold text-center">加入測驗</h1>
            <Input
              type="text"
              placeholder="輸入4位數PIN碼"
              value={pin}
              onChange={handlePinChange}
              readOnly={pin.length >= 6}
              className={pin.length >= 6 ? 'bg-gray-100' : ''}
              maxLength={8}
            />
            <Input
              type="text"
              placeholder="員工號+名字任意取"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus={!!pin}
            />
            <Button className="w-full text-xl bg-blue-900" onClick={handleJoin}>
              加入！
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (gameState?.status === 'finished') {
    return (
      <GameResults
        scores={gameState.scores}
        playerName={name}
        onFinish={handleFinish}
      />
    );
  }

  const rankInfo = getCurrentRank();
  const currentQuestion = currentQuiz?.questions[gameState?.currentQuestionIndex ?? -1];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Welcome, {name}!</h2>
          {rankInfo && (
            <div className="text-sm text-gray-600">
              Score: {rankInfo.score}
            </div>
          )}
        </div>

        {gameState?.status === 'waiting' && (
          <div className="text-center text-gray-500">
            Waiting for game to start...
          </div>
        )}

        {gameState?.status === 'question' && currentQuestion && (
          <div className="space-y-6">
            <div className="text-2xl font-medium text-center">
              {currentQuestion.question}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 aspect-[2/1]">
              {currentQuestion.options.map((option, index) => (
                <Button
                  key={index}
                  className={`w-full h-full text-lg transition-colors ${
                    selectedAnswer === index 
                      ? `${OPTION_SELECTED_COLORS[index]} text-black`
                      : answerSubmitted
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : `${OPTION_COLORS[index]} text-black`
                  }`}
                  disabled={answerSubmitted}
                  onClick={() => handleAnswerSubmit(index)}
                >
                  {option}
                </Button>
              ))}
            </div>
            {answerSubmitted && (
              <div className="text-center text-green-600 text-lg">
                Answer locked in!
              </div>
            )}
          </div>
        )}

        {gameState?.status === 'answer' && rankInfo && (
          <div className="space-y-4">
            <div className="p-6 bg-gray-50 rounded-lg text-center">
              <div className="text-2xl font-bold mb-2">
                Current Position: #{rankInfo.rank}
              </div>
              <div className="text-lg">
                Score: {rankInfo.score} points
              </div>
              <div className="text-sm text-gray-500">
                Out of {rankInfo.totalPlayers} players
              </div>
            </div>
            {selectedAnswer !== null && currentQuestion && (
              <div className="text-center">
                Your answer: {currentQuestion.options[selectedAnswer]}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
