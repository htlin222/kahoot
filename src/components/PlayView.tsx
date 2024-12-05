import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { useToast } from './ui/use-toast';
import { gameService, GameState } from '../services/gameService';
import { GameResults } from './GameResults';

export function PlayView() {
  const [pin, setPin] = useState('');
  const [name, setName] = useState('');
  const [joined, setJoined] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!joined) return;

    const interval = setInterval(async () => {
      try {
        const state = await gameService.getGameState();
        setGameState(state);
        if (state?.status === 'question') {
          setAnswerSubmitted(false);
          setSelectedAnswer(null);
        }
      } catch (error) {
        console.error('Error fetching game state:', error);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [joined]);

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
    setJoined(false);
    setPin('');
    setName('');
    setGameState(null);
    setSelectedAnswer(null);
    setAnswerSubmitted(false);
  };

  if (!joined) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md p-6 space-y-4">
          <h1 className="text-2xl font-bold text-center">Join Game</h1>
          <Input
            type="text"
            placeholder="Enter game PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
          />
          <Input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button className="w-full" onClick={handleJoin}>
            Join
          </Button>
        </Card>
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

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Welcome, {name}!</h2>
          {gameState?.status === 'waiting' && (
            <div className="text-sm text-gray-500">Waiting for game to start...</div>
          )}
        </div>

        {gameState?.status === 'question' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[0, 1, 2, 3].map((index) => (
                <Button
                  key={index}
                  className={`h-24 ${
                    selectedAnswer === index ? 'bg-blue-500' : ''
                  }`}
                  disabled={answerSubmitted}
                  onClick={() => handleAnswerSubmit(index)}
                >
                  Option {index + 1}
                </Button>
              ))}
            </div>
            {answerSubmitted && (
              <div className="text-center text-green-600">
                Answer submitted! Waiting for next question...
              </div>
            )}
          </div>
        )}

        {gameState?.status === 'answer' && (
          <div className="text-center text-gray-600">
            Waiting for next question...
          </div>
        )}
      </Card>
    </div>
  );
}
