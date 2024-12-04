import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const API_URL = 'http://localhost:3002';

export function PlayView() {
  const [searchParams] = useSearchParams();
  const [name, setName] = useState('');
  const [pin, setPin] = useState(searchParams.get('pin') || '');
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState('');

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

  if (joined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Welcome, {name}!</h2>
          <p className="text-gray-600">Waiting for the game to start...</p>
        </div>
      </div>
    );
  }

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
          
          <button
            onClick={handleJoin}
            disabled={!name.trim() || pin.length !== 4}
            className={`
              w-full p-3 rounded-lg font-semibold text-white
              ${(name.trim() && pin.length === 4)
                ? 'bg-blue-500 hover:bg-blue-600' 
                : 'bg-gray-300 cursor-not-allowed'}
              transition-colors
            `}
          >
            Join
          </button>
        </div>
      </div>
    </div>
  );
}
