interface PlayerListProps {
  players: string[];
}

export function PlayerList({ players }: PlayerListProps) {
  // Calculate dynamic font size based on number of players
  const getFontSize = (playerCount: number) => {
    if (playerCount <= 10) return 'text-base';
    if (playerCount <= 20) return 'text-sm';
    return 'text-xs';
  };

  const getPlayerSize = (playerCount: number) => {
    if (playerCount <= 10) return 'h-10';
    if (playerCount <= 20) return 'h-8';
    return 'h-6';
  };

  const fontSize = getFontSize(players.length);
  const playerSize = getPlayerSize(players.length);

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-xl font-semibold mb-4">Connected Players ({players.length})</h2>
      <div className="flex-1 bg-white rounded-lg shadow p-4 overflow-y-auto">
        {players.length === 0 ? (
          <p className="text-gray-500 text-center">Waiting for players to join...</p>
        ) : (
          <ul className="space-y-1">
            {players.map((player, index) => (
              <li 
                key={index}
                className={`${playerSize} ${fontSize} bg-gray-50 rounded flex items-center gap-2 px-2`}
              >
                <span className={`${playerSize === 'h-10' ? 'w-8' : playerSize === 'h-8' ? 'w-6' : 'w-5'} h-full aspect-square bg-blue-500 text-white rounded-full flex items-center justify-center ${fontSize}`}>
                  {index + 1}
                </span>
                <span className="truncate">{player}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
