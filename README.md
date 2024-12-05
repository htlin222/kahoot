# Interactive Quiz Platform

A real-time interactive quiz platform inspired by Kahoot, enabling educators to create engaging quiz sessions and students to participate in interactive learning experiences.

## Features

- **Quiz Creation & Management**
  - Create custom quizzes with multiple question types
  - Edit and manage quiz content
  - Set time limits and scoring rules

- **Real-time Game Sessions**
  - Host live quiz sessions
  - Real-time player participation
  - Instant feedback and scoring
  - Live leaderboard updates

- **Multiple Views**
  - Teacher/Admin dashboard for quiz management
  - Game host view for controlling sessions
  - Player view for quiz participation
  - Results view for session outcomes

## Tech Stack

- **Frontend**
  - React with TypeScript
  - Vite for build tooling
  - TailwindCSS for styling
  - Shadcn UI components
  - Zustand for state management

- **Backend**
  - Node.js server
  - Redis for real-time data handling
  - WebSocket for live updates

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Redis server
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/kahoot.git
cd kahoot
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Create a `.env` file in the root directory with:
```env
REDIS_URL=your_redis_url
PORT=3002
```

4. Start the application:
```bash
# Start the backend server
npm run server

# In a new terminal, start the frontend development server
npm run dev
```

The application will be available at `http://localhost:3000`

## Usage

### Application URLs
- `/teacher` - Access the teacher dashboard for creating and managing quizzes
- `/admin` - Access the administrative interface
- `/play` - Join and participate in quiz games

### Creating and Managing Quizzes
1. **Creating a Quiz**
   - Log in as a teacher/admin
   - Navigate to "Create Quiz"
   - Add questions and answers
   - Save your quiz

2. **Starting a Game**
   - Select a quiz from your library
   - Click "Start Game"
   - Share the game code with participants

3. **Joining a Game**
   - Enter the game code
   - Input your name
   - Wait for the host to start

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on how to:
- Set up your development environment
- Submit pull requests
- Report issues
- Follow our coding standards

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
