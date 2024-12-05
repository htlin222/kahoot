import { QRCodeSVG } from 'qrcode.react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { QuizSet } from '../types/quiz';

interface GameSetupProps {
  pinCode: string;
  players: string[];
  selectedQuiz: QuizSet | null;
  onStartGame: () => void;
}

export function GameSetup({ pinCode, players, selectedQuiz, onStartGame }: GameSetupProps) {
  return (
    <div className="space-y-8 w-full max-w-md mx-auto">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Selected Quiz</h2>
        {selectedQuiz ? (
          <div className="space-y-2">
            <p className="font-medium">{selectedQuiz.title}</p>
            <p className="text-sm text-gray-500">{selectedQuiz.questions.length} questions</p>
            <Button 
              className="w-full mt-4"
              onClick={onStartGame}
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
    </div>
  );
}
