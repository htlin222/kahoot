import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const API_URL = 'http://localhost:3002';

export function TeacherView() {
  const [players, setPlayers] = useState<string[]>([]);
  const [pinCode, setPinCode] = useState<string>('');

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

  // Poll for players
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

  const handleReset = () => {
    fetch(`${API_URL}/api/teacher/reset`, {
      method: 'POST'
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPinCode(data.pin);
          setPlayers([]);
        }
      })
      .catch(err => console.error('Error resetting game:', err));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-8">
      <h1 className="text-3xl font-bold">Teacher View</h1>
      
      <div className="text-center">
        <div className="text-6xl font-bold mb-4 text-blue-600">{pinCode}</div>
        <p className="text-gray-600">Share this PIN code with your students</p>
        <button
          onClick={handleReset}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Reset Game
        </button>
      </div>

      <div className="p-4 bg-white rounded-lg shadow-lg">
        <QRCodeSVG value={`${window.location.origin}/play?pin=${pinCode}`} size={256} />
      </div>

      <div className="w-full max-w-md">
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
  );
}
