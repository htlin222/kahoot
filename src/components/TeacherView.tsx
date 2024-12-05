import { QuizList } from './QuizList';
import { GameSetup } from './GameSetup';
import { ActiveGame } from './ActiveGame';
import { GameResults } from './GameResults';
import { useGameState } from '../hooks/useGameState';
import { useState } from 'react';

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

  const [isQuizListCollapsed, setIsQuizListCollapsed] = useState(false);

  const handleEndGame = async () => {
    await finishGame();
  };

  return (
    <div className="flex h-screen">
      <QuizList
        quizzes={quizzes}
        selectedQuizId={selectedQuiz?.quizId || ''}
        isCollapsed={isQuizListCollapsed}
        onQuizSelect={setSelectedQuiz}
        onQuizDelete={onQuizDelete}
        onToggleCollapse={() => setIsQuizListCollapsed(!isQuizListCollapsed)}
        onQuizzesUpdate={onQuizzesUpdate}
      />

      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-8">
        <h1 className="text-3xl font-bold">Teacher View</h1>
        
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
    </div>
  );
}
