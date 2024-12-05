# Contributing to Interactive Quiz Platform

We love your input! We want to make contributing to this quiz platform as easy and transparent as possible, whether it's:
- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code lints
6. Issue that pull request!

## Project Structure

```
src/
├── components/         # React components
│   ├── ui/            # Reusable UI components
│   └── ...            # Feature-specific components
├── hooks/             # Custom React hooks
├── lib/               # Utility functions and constants
├── server/            # Backend server code
│   ├── config/        # Server configuration
│   └── services/      # Business logic services
├── services/          # Frontend services
├── store/             # State management
└── types/             # TypeScript type definitions
```

## Development Setup

1. **Prerequisites**
   - Node.js (v16 or higher)
   - Redis server
   - npm or yarn
   - Git

2. **First Time Setup**
   ```bash
   # Clone your fork
   git clone https://github.com/your-username/kahoot.git
   cd kahoot

   # Install dependencies
   npm install

   # Setup pre-commit hooks
   npm run prepare
   ```

3. **Running Locally**
   ```bash
   # Start Redis server
   redis-server

   # Start the backend server
   npm run server

   # In a new terminal, start the frontend development server
   npm run dev
   ```

## Code Style Guide

We use ESLint and Prettier to maintain code quality. Our style guide includes:

- TypeScript for type safety
- Functional components with hooks for React code
- Tailwind CSS for styling
- Jest for testing

### Naming Conventions

- **Components**: PascalCase (e.g., `QuizEditor.tsx`)
- **Hooks**: camelCase with 'use' prefix (e.g., `useGameState.ts`)
- **Utilities**: camelCase (e.g., `formatScore.ts`)
- **Types/Interfaces**: PascalCase (e.g., `QuizType.ts`)

## Pull Request Process

1. Update the README.md with details of changes if applicable
2. Update the CHANGELOG.md with a note describing your changes
3. The PR will be merged once you have the sign-off of at least one maintainer

## Testing

- Write unit tests for new functionality
- Ensure all tests pass before submitting PR
- Include relevant test cases

```bash
# Run tests
npm test

# Run tests in watch mode
npm test:watch
```

## Bug Reports

We use GitHub issues to track public bugs. Report a bug by opening a new issue.

**Great Bug Reports** tend to have:
- A quick summary and/or background
- Steps to reproduce
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening)

## License

By contributing, you agree that your contributions will be licensed under its MIT License.
