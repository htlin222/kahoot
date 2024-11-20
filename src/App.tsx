import { useState } from 'react';

const DemoButton = () => {
  const [clicks, setClicks] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <button
        onClick={() => setClicks(prev => prev + 1)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          px-6 py-3 rounded-lg
          transition-all duration-200
          ${isHovered
            ? 'bg-blue-600 scale-105'
            : 'bg-blue-500'
          }
          text-white font-semibold
          hover:shadow-lg
          active:scale-95
        `}
      >
        Click Me!
      </button>

      <div className="text-gray-700 text-lg">
        Clicks: {clicks}
      </div>
    </div>
  );
};

export default DemoButton;
