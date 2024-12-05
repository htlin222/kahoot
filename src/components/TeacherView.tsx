import { GameSetup } from './GameSetup';
import { ActiveGame } from './ActiveGame';
import { GameResults } from './GameResults';
import { useGameState } from '../hooks/useGameState';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Download, Trash2, Upload } from 'lucide-react';
import { useToast } from './ui/use-toast';
import { quizService } from '../services/quizService';
import { useEffect, useRef } from 'react';
import { PlayerList } from './PlayerList';

export function TeacherView() {
  const {
    players,
    pinCode,
    gameState,
    selectedQuiz,
    quizzes,
    setSelectedQuiz,
    onQuizDelete,
    onQuizzesUpdate,
    startGame,
    showAnswer,
    nextQuestion,
    finishGame,
    resetGame
  } = useGameState();

  const { toast } = useToast();
  const prevPlayersRef = useRef<string[]>([]);

  // Monitor player joins
  useEffect(() => {
    const newPlayers = players.filter(player => !prevPlayersRef.current.includes(player));
    newPlayers.forEach(player => {
      toast({
        title: 'New Player Joined',
        description: player,
        duration: 3000,
      });
    });
    prevPlayersRef.current = players;
  }, [players, toast]);

  const handleExport = async (quiz: typeof selectedQuiz) => {
    if (!quiz) return;
    try {
      const data = await quizService.exportQuiz(quiz.quizId);
      const dataStr = JSON.stringify(data, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `quiz-${quiz.quizId}.json`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export quiz',
        variant: 'destructive'
      });
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const text = await file.text();
        const importedQuiz = JSON.parse(text);
        
        if (!quizService.validateQuizStructure(importedQuiz)) {
          throw new Error('Invalid quiz structure');
        }

        const newQuizId = crypto.randomUUID();
        
        await quizService.saveQuiz({
          ...importedQuiz,
          quizId: newQuizId
        });

        toast({
          title: 'Success',
          description: 'Quiz imported successfully'
        });

        if (event.target) {
          event.target.value = '';
        }

        onQuizzesUpdate();
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to import quiz',
          variant: 'destructive'
        });
      }
    }
  };

  const handleEndGame = async () => {
    await finishGame();
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b relative z-50">
        <h1 className="text-3xl font-bold">Kahoot</h1>
        
        <div className="flex gap-2">
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
            id="import-quiz"
            title="Import Quiz File"
            aria-label="Import Quiz File"
          />
          <Button
            variant="outline"
            onClick={() => document.getElementById('import-quiz')?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Import Quiz
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default">
                {selectedQuiz ? selectedQuiz.title : 'Select Quiz'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {quizzes.map((quiz) => (
                <DropdownMenuItem
                  key={quiz.quizId}
                  className="flex items-center justify-between"
                  onSelect={() => setSelectedQuiz(quiz)}
                >
                  <div className="flex-1">
                    <div>{quiz.title}</div>
                    <div className="text-sm text-gray-500">{quiz.questions.length} questions</div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExport(quiz);
                      }}
                      title="Export Quiz"
                      aria-label="Export Quiz"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuizDelete(quiz.quizId);
                      }}
                      title="Delete Quiz"
                      aria-label="Delete Quiz"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 p-4 overflow-auto">
          {!gameState && (
            <GameSetup
              pinCode={pinCode}
              players={players}
              selectedQuiz={selectedQuiz}
              onStartGame={startGame}
            />
          )}

          {gameState && gameState.status !== 'finished' && selectedQuiz && (
            <ActiveGame
              gameState={gameState}
              quiz={selectedQuiz}
              players={players}
              onNextQuestion={nextQuestion}
              onShowAnswer={showAnswer}
              onEndGame={handleEndGame}
            />
          )}

          {gameState && gameState.status === 'finished' && (
            <GameResults
              scores={gameState.scores}
              onFinish={resetGame}
            />
          )}
        </div>

        <div className="w-1/2 border-l bg-gray-50 p-4 overflow-auto">
          <PlayerList players={players} />
        </div>
      </div>
    </div>
  );
}
