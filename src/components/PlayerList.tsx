interface PlayerListProps {
  players: string[];
}

export function PlayerList({ players }: PlayerListProps) {
  return (
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
  );
}
