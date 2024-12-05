import { io } from 'socket.io-client';
import type { Socket as SocketType } from 'socket.io-client';
import {
  JoinGamePayload,
  SubmitAnswerPayload,
  StartGamePayload,
  PlayerJoinedEvent,
  PlayersUpdateEvent,
  AnswerConfirmedEvent,
  AnswerReceivedEvent,
  GameStartedEvent,
  QuestionStartedEvent,
  AnswerRevealedEvent,
  GameEndedEvent,
  ErrorEvent
} from '../types/socket';

class SocketService {
  private socket: SocketType | null = null;
  private eventHandlers: Map<string, ((...args: any[]) => void)[]> = new Map();

  connect() {
    if (this.socket?.connected) return;

    this.socket = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:3002', {
      transports: ['websocket'],
      autoConnect: true
    });

    this.setupBaseHandlers();
  }

  private setupBaseHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to game server');
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('Connection error:', error);
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('Disconnected:', reason);
    });
  }

  // Player Actions
  joinGame(payload: JoinGamePayload) {
    this.socket?.emit('join_game', payload);
  }

  submitAnswer(payload: SubmitAnswerPayload) {
    this.socket?.emit('submit_answer', payload);
  }

  // Teacher Actions
  startGame(payload: StartGamePayload) {
    this.socket?.emit('start_game', payload);
  }

  nextQuestion() {
    this.socket?.emit('next_question');
  }

  showAnswer() {
    this.socket?.emit('show_answer');
  }

  endGame() {
    this.socket?.emit('end_game');
  }

  // Event Listeners
  on<T>(event: string, handler: (data: T) => void) {
    if (!this.socket) return;

    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
      this.socket.on(event, (data: T) => {
        const handlers = this.eventHandlers.get(event) || [];
        handlers.forEach(h => h(data));
      });
    }

    const handlers = this.eventHandlers.get(event) || [];
    handlers.push(handler);
    this.eventHandlers.set(event, handlers);
  }

  off(event: string, handler: (data: any) => void) {
    const handlers = this.eventHandlers.get(event) || [];
    const index = handlers.indexOf(handler);
    if (index !== -1) {
      handlers.splice(index, 1);
      this.eventHandlers.set(event, handlers);
    }
  }

  // Event Types
  onPlayerJoined(handler: (data: PlayerJoinedEvent) => void) {
    this.on('player_joined', handler);
  }

  onPlayersUpdate(handler: (data: PlayersUpdateEvent) => void) {
    this.on('players_update', handler);
  }

  onAnswerConfirmed(handler: (data: AnswerConfirmedEvent) => void) {
    this.on('answer_confirmed', handler);
  }

  onAnswerReceived(handler: (data: AnswerReceivedEvent) => void) {
    this.on('answer_received', handler);
  }

  onGameStarted(handler: (data: GameStartedEvent) => void) {
    this.on('game_started', handler);
  }

  onQuestionStarted(handler: (data: QuestionStartedEvent) => void) {
    this.on('question_started', handler);
  }

  onAnswerRevealed(handler: (data: AnswerRevealedEvent) => void) {
    this.on('answer_revealed', handler);
  }

  onGameEnded(handler: (data: GameEndedEvent) => void) {
    this.on('game_ended', handler);
  }

  onError(handler: (data: ErrorEvent) => void) {
    this.on('join_error', handler);
    this.on('answer_error', handler);
    this.on('game_error', handler);
  }

  disconnect() {
    if (this.socket?.connected) {
      this.socket.disconnect();
    }
    this.eventHandlers.clear();
    this.socket = null;
  }
}

// Create a singleton instance
const socketService = new SocketService();
export default socketService;
