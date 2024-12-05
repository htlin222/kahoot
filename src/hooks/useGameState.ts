import { useState, useEffect } from 'react';
import { QuizSet } from '../types/quiz';
import { gameService, GameState } from '../services/gameService';
import { quizService } from '../services/quizService';
import { useToast } from '../components/ui/use-toast';

export function useGameState() {
  const [players, setPlayers] = useState<string[]>([]);
  const [pinCode, setPinCode] = useState<string>('');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<QuizSet | null>(null);
  const [quizzes, setQuizzes] = useState<QuizSet[]>([]);
  const { toast } = useToast();

  // Fetch quizzes
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

  // Load quizzes on mount
  useEffect(() => {
    loadQuizzes();
  }, []);

  // Fetch initial PIN
  useEffect(() => {
    gameService.getPin()
      .then(pin => setPinCode(pin))
      .catch(error => {
        toast({
          title: 'Error',
          description: 'Failed to get game PIN',
          variant: 'destructive'
        });
      });
  }, []);

  // Poll for players
  useEffect(() => {
    const interval = setInterval(() => {
      gameService.getPlayers()
        .then(setPlayers)
        .catch(error => console.error('Error fetching players:', error));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Poll for game state when game is active
  useEffect(() => {
    if (!gameState) return;

    const interval = setInterval(() => {
      gameService.getGameState()
        .then(setGameState)
        .catch(error => console.error('Error fetching game state:', error));
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState]);

  const handleQuizSelect = (quiz: QuizSet) => {
    setSelectedQuiz(quiz);
  };

  const handleQuizDelete = async (quizId: string) => {
    try {
      await quizService.deleteQuiz(quizId);
      await loadQuizzes();
      if (selectedQuiz?.quizId === quizId) {
        setSelectedQuiz(null);
      }
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

  const startGame = async () => {
    if (!selectedQuiz) {
      toast({
        title: 'Error',
        description: 'Please select a quiz first',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Reset game state and clear players before starting new game
      const { success, pin } = await gameService.resetGame();
      if (success) {
        setPinCode(pin);
        setPlayers([]);
      }

      // Start the new game
      const newGameState = await gameService.startGame(selectedQuiz.quizId);
      setGameState(newGameState);
      // Immediately show first question after game starts
      const firstQuestion = await gameService.nextQuestion();
      setGameState(firstQuestion);
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

  const showAnswer = async () => {
    try {
      const newGameState = await gameService.showAnswer();
      setGameState(newGameState);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to show answer',
        variant: 'destructive'
      });
    }
  };

  const nextQuestion = async () => {
    try {
      const newGameState = await gameService.nextQuestion();
      setGameState(newGameState);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to move to next question',
        variant: 'destructive'
      });
    }
  };

  const finishGame = async () => {
    try {
      const newGameState = await gameService.finishGame();
      setGameState(newGameState);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to finish game',
        variant: 'destructive'
      });
    }
  };

  const resetGame = async () => {
    try {
      const { success, pin } = await gameService.resetGame();
      if (success) {
        setPinCode(pin);
        setPlayers([]);
        setGameState(null);
        setSelectedQuiz(null);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reset game',
        variant: 'destructive'
      });
    }
  };

  return {
    players,
    pinCode,
    gameState,
    selectedQuiz,
    quizzes,
    setSelectedQuiz: handleQuizSelect,
    onQuizDelete: handleQuizDelete,
    onQuizzesUpdate: loadQuizzes,
    startGame,
    showAnswer,
    nextQuestion,
    finishGame,
    resetGame
  };
}
