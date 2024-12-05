import { GameState } from './quiz';

export interface JoinGamePayload {
  pin: string;
  name: string;
}

export interface SubmitAnswerPayload {
  answer: number;
}

export interface StartGamePayload {
  quizId: string;
}

export interface PlayerJoinedEvent {
  name: string;
}

export interface PlayersUpdateEvent {
  players: string[];
}

export interface AnswerConfirmedEvent {
  answerTime: number;
}

export interface AnswerReceivedEvent {
  playerName: string;
  answerTime: number;
}

export interface GameStartedEvent {
  gameState: GameState;
  pin: string;
}

export interface QuestionStartedEvent {
  gameState: GameState;
}

export interface AnswerRevealedEvent {
  gameState: GameState;
}

export interface GameEndedEvent {
  gameState: GameState;
}

export interface ErrorEvent {
  message: string;
}
