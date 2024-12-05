import { Button } from './ui/button';
import { Card } from './ui/card';

interface GameResultsProps {
  scores: Record<string, number>;
  playerName?: string;  // Optional: only needed for PlayView
  onFinish: () => void;
}

export function GameResults({ scores, playerName, onFinish }: GameResultsProps) {
  const allPlayers = Object.entries(scores)
    .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
    .map(([name, score], index) => ({
      rank: index + 1,
      name,
      score
    }));

  // For PlayView, find the player's rank
  const playerResult = playerName 
    ? allPlayers.find(p => p.name === playerName)
    : null;

  return (
    <div className="space-y-8 w-full max-w-md mx-auto p-4">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {playerName ? 'Your Result' : 'Final Results'}
        </h2>

        {playerName && playerResult && (
          <div className="mb-8">
            <div className={`p-4 rounded-lg text-center mb-4 ${
              playerResult.rank === 1 ? 'bg-yellow-100' :
              playerResult.rank === 2 ? 'bg-gray-100' :
              playerResult.rank === 3 ? 'bg-orange-100' :
              'bg-white'
            }`}>
              <div className="text-4xl font-bold mb-2">#{playerResult.rank}</div>
              <div className="text-xl">{playerResult.score} points</div>
            </div>
          </div>
        )}

        {(!playerName || playerResult) && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold mb-3">
              {playerName ? 'All Players' : 'Rankings'}
            </h3>
            {allPlayers.map((player) => (
              <div 
                key={player.name}
                className={`flex justify-between items-center p-2 rounded-lg ${
                  player.name === playerName ? 'border-2 border-blue-500' : ''
                } ${
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
        )}

        <Button 
          className="w-full mt-6"
          onClick={onFinish}
        >
          Bye!
        </Button>
      </Card>
    </div>
  );
}
