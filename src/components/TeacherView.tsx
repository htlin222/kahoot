import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QuizList } from './QuizList';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { useToast } from './ui/use-toast';
import { QuizSet } from '../types/quiz';
import { quizService } from '../services/quizService';

const API_URL = 'http://localhost:3002';

type GameState = {
  status: 'waiting' | 'question' | 'answer';
  currentQuestionIndex: number;
  quizId: string;
  scores: Record<string, number>;
};

export function TeacherView() {
  const [players, setPlayers] = useState<string[]>([]);
  const [pinCode, setPinCode] = useState<string>('');
  const [quizzes, setQuizzes] = useState<QuizSet[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<QuizSet | null>(null);
  const [isQuizListCollapsed, setIsQuizListCollapsed] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<number>(-1);
  const { toast } = useToast();

  // Fetch quizzes
  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      const fetchedQuizzes = await quizService.fetchQuizzes();
      setQuizzes(fetchedQuizzes);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load quizzes',
        variant: 'destructive'
      });
    }
  };

  // Fetch initial PIN
  useEffect(() => {
    fetch(`${API_URL}/api/teacher/pin`)
      .then(res => res.json())
      .then(data => {
        console.log('Received PIN:', data.pin);
        setPinCode(data.pin);
      })
      .catch(err => console.error('Error fetching PIN:', err));
  }, []);

  // Poll for players continuously, regardless of game state
  useEffect(() => {
    const interval = setInterval(() => {
      fetch(`${API_URL}/api/teacher/players`)
        .then(res => res.json())
        .then(data => {
          setPlayers(data.players);
        })
        .catch(err => console.error('Error fetching players:', err));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Poll for game state when game is active
  useEffect(() => {
    if (!gameState) return;

    const interval = setInterval(() => {
      fetch(`${API_URL}/api/game/state`)
        .then(res => res.json())
        .then(data => {
          setGameState(data);
          setCurrentQuestion(data.currentQuestionIndex);
        })
        .catch(err => console.error('Error fetching game state:', err));
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState]);

  const handleQuizSelect = (quiz: QuizSet) => {
    setSelectedQuiz(quiz);
  };

  const handleQuizDelete = async (quizId: string) => {
    try {
      await quizService.deleteQuiz(quizId);
      loadQuizzes();
      toast({
        title: 'Success',
        description: 'Quiz deleted successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete quiz',
        variant: 'destructive'
      });
    }
  };

  const handleStartGame = async () => {
    if (!selectedQuiz) {
      toast({
        title: 'Error',
        description: 'Please select a quiz first',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/teacher/start-game`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quizId: selectedQuiz.quizId })
      });
      
      const data = await response.json();
      setGameState(data);
      toast({
        title: 'Success',
        description: 'Game started successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start game',
        variant: 'destructive'
      });
    }
  };

  const handleNextQuestion = async () => {
    try {
      const response = await fetch(`${API_URL}/api/teacher/next-question`, {
        method: 'POST'
      });
      const data = await response.json();
      setGameState(data);
      setCurrentQuestion(data.currentQuestionIndex);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to move to next question',
        variant: 'destructive'
      });
    }
  };

  const handleReset = () => {
    fetch(`${API_URL}/api/teacher/reset`, {
      method: 'POST'
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPinCode(data.pin);
          setPlayers([]);
          setGameState(null);
          setCurrentQuestion(-1);
          setSelectedQuiz(null);
        }
      })
      .catch(err => console.error('Error resetting game:', err));
  };

  return (
    <div className="flex h-screen">
      <QuizList
        quizzes={quizzes}
        selectedQuizId={selectedQuiz?.quizId || ''}
        isCollapsed={isQuizListCollapsed}
        onQuizSelect={handleQuizSelect}
        onQuizDelete={handleQuizDelete}
        onToggleCollapse={() => setIsQuizListCollapsed(!isQuizListCollapsed)}
        onQuizzesUpdate={loadQuizzes}
      />

      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-8">
        <h1 className="text-3xl font-bold">Teacher View</h1>
        
        {!gameState ? (
          // Pre-game state
          <div className="space-y-8 w-full max-w-md">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Selected Quiz</h2>
              {selectedQuiz ? (
                <div className="space-y-2">
                  <p className="font-medium">{selectedQuiz.title}</p>
                  <p className="text-sm text-gray-500">{selectedQuiz.questions.length} questions</p>
                  <Button 
                    className="w-full mt-4"
                    onClick={handleStartGame}
                    disabled={players.length === 0}
                  >
                    {players.length === 0 ? 'Waiting for players...' : 'Start Game'}
                  </Button>
                </div>
              ) : (
                <p className="text-gray-500">Select a quiz from the sidebar to begin</p>
              )}
            </Card>

            <div className="text-center">
              <div className="text-6xl font-bold mb-4 text-blue-600">{pinCode}</div>
              <p className="text-gray-600">Share this PIN code with your students</p>
              <div className="mt-4">
                <QRCodeSVG 
                  value={`${window.location.origin}/play?pin=${pinCode}`} 
                  size={256}
                  className="mx-auto"
                />
              </div>
            </div>

            <div className="w-full">
              <h2 className="text-xl font-semibold mb-4">Connected Players ({players.length})</h2>
              <div className="bg-white rounded-lg shadow p-4">
                {players.length === 0 ? (
                  <p className="text-gray-500 text-center">Waiting for players to join...</p>
                ) : (
                  <ul className="space-y-2">
                    {players.map((player, index) => (
                      <li 
                        key={index}
                        className="p-2 bg-gray-50 rounded flex items-center gap-2"
                      >
                        <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center">
                          {index + 1}
                        </span>
                        {player}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        ) : (
          // Active game state
          <div className="space-y-8 w-full max-w-md">
            {selectedQuiz && currentQuestion >= 0 && currentQuestion < selectedQuiz.questions.length && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Question {currentQuestion + 1} of {selectedQuiz.questions.length}
                </h2>
                <p className="mb-4">{selectedQuiz.questions[currentQuestion].question}</p>
                <div className="space-y-2">
                  {selectedQuiz.questions[currentQuestion].options.map((option, index) => (
                    <div 
                      key={index}
                      className={`p-3 rounded-lg ${
                        index === selectedQuiz.questions[currentQuestion].correctAnswer
                          ? 'bg-green-100 border-green-500'
                          : 'bg-gray-100'
                      }`}
                    >
                      {option}
                    </div>
                  ))}
                </div>
                <Button 
                  className="w-full mt-4"
                  onClick={handleNextQuestion}
                  disabled={currentQuestion >= selectedQuiz.questions.length - 1}
                >
                  Next Question
                </Button>
              </Card>
            )}

            <div className="w-full">
              <h2 className="text-xl font-semibold mb-4">Connected Players ({players.length})</h2>
              <div className="bg-white rounded-lg shadow p-4">
                {players.length === 0 ? (
                  <p className="text-gray-500 text-center">Waiting for players to join...</p>
                ) : (
                  <ul className="space-y-2">
                    {players.map((player, index) => (
                      <li 
                        key={index}
                        className="p-2 bg-gray-50 rounded flex items-center gap-2"
                      >
                        <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center">
                          {index + 1}
                        </span>
                        {player}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <Button
              variant="destructive"
              className="w-full"
              onClick={handleReset}
            >
              End Game
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
