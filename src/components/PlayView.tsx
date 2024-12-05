import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from './ui/button';
import { Card } from './ui/card';

const API_URL = 'http://localhost:3002';

type GameState = {
  status: 'waiting' | 'question' | 'answer';
  currentQuestionIndex: number;
  quizId: string;
  scores: Record<string, number>;
};

type Question = {
  question: string;
  options: string[];
  correctAnswer: number;
};

export function PlayView() {
  const [searchParams] = useSearchParams();
  const [name, setName] = useState('');
  const [pin, setPin] = useState(searchParams.get('pin') || '');
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState('');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  // Poll for game state when joined
  useEffect(() => {
    if (!joined) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${API_URL}/api/game/state`);
        const data = await response.json();
        
        if (!response.ok) {
          console.error('Failed to fetch game state:', data.error);
          return;
        }

        setGameState(data);

        // Reset answer state when question changes
        if (data.currentQuestionIndex !== gameState?.currentQuestionIndex) {
          setSelectedAnswer(null);
          setAnswerSubmitted(false);
          
          // Fetch question details if in question state
          if (data.status === 'question') {
            const quizResponse = await fetch(`${API_URL}/api/quiz/${data.quizId}`);
            const quizData = await quizResponse.json();
            setCurrentQuestion(quizData.questions[data.currentQuestionIndex]);
          }
        }
      } catch (err) {
        console.error('Error fetching game state:', err);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [joined, gameState?.currentQuestionIndex]);

  const handleJoin = async () => {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!pin.trim() || pin.length !== 4) {
      setError('Please enter a valid 4-digit PIN');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/play/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          pin: pin.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to join the game');
        return;
      }

      setJoined(true);
      setError('');
    } catch (err) {
      console.error('Error joining game:', err);
      setError('Failed to connect to the game server');
    }
  };

  const handleAnswerSubmit = async (answerIndex: number) => {
    if (answerSubmitted) return;

    try {
      const response = await fetch(`${API_URL}/api/play/submit-answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerName: name,
          answer: answerIndex
        })
      });

      if (!response.ok) {
        console.error('Failed to submit answer');
        return;
      }

      setSelectedAnswer(answerIndex);
      setAnswerSubmitted(true);
    } catch (err) {
      console.error('Error submitting answer:', err);
    }
  };

  if (!joined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-8">Join Game</h1>
          
          <div className="space-y-4">
            <div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <input
                type="text"
                value={pin}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setPin(value);
                }}
                placeholder="Enter 4-digit PIN"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={4}
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">
                {error}
              </div>
            )}
            
            <Button
              onClick={handleJoin}
              disabled={!name.trim() || pin.length !== 4}
              className="w-full"
              variant={name.trim() && pin.length === 4 ? "default" : "secondary"}
            >
              Join
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!gameState || gameState.status === 'waiting') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md p-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Welcome, {name}!</h2>
          <p className="text-gray-600">Waiting for the game to start...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">{name}</h2>
          <div className="text-blue-600 font-semibold">Score: {score}</div>
        </div>

        {currentQuestion && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">{currentQuestion.question}</h3>
            <div className="grid grid-cols-2 gap-4">
              {currentQuestion.options.map((option, index) => (
                <Button
                  key={index}
                  onClick={() => handleAnswerSubmit(index)}
                  disabled={answerSubmitted}
                  variant={selectedAnswer === index ? "default" : "outline"}
                  className={`h-24 whitespace-normal ${
                    answerSubmitted && selectedAnswer === index
                      ? index === currentQuestion.correctAnswer
                        ? "bg-green-500 hover:bg-green-600"
                        : "bg-red-500 hover:bg-red-600"
                      : ""
                  }`}
                >
                  {option}
                </Button>
              ))}
            </div>
            {answerSubmitted && (
              <div className="text-center mt-4">
                {selectedAnswer === currentQuestion.correctAnswer ? (
                  <p className="text-green-600 font-semibold">Correct!</p>
                ) : (
                  <p className="text-red-600 font-semibold">
                    Incorrect! The correct answer was: {currentQuestion.options[currentQuestion.correctAnswer]}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
