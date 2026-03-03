import { z } from 'zod';

// Quiz Validation
export const CreateQuizSchema = z.object({
  title: z.string().min(1, 'Quiz title is required').max(200),
  questions: z.array(
    z.object({
      text: z.string().min(1, 'Question text is required').max(500),
      timerSeconds: z.number().int().min(5).max(60).default(20),
      choices: z.array(
        z.object({
          text: z.string().min(1).max(200),
          isCorrect: z.boolean(),
        })
      ).min(2).max(4),
    })
  ).min(3).max(10),
});

// Session Validation
export const CreateSessionSchema = z.object({
  quizId: z.string().cuid('Invalid quiz ID'),
});

export const JoinSessionSchema = z.object({
  code: z.string().min(6).max(6),
  playerName: z.string().min(1).max(50),
});

// Answer Validation
export const SubmitAnswerSchema = z.object({
  sessionId: z.string().cuid(),
  playerId: z.string().cuid(),
  questionId: z.string().cuid(),
  selectedChoiceId: z.string().cuid(),
  timeTaken: z.number().int().positive(),
});

export type CreateQuizInput = z.infer<typeof CreateQuizSchema>;
export type CreateSessionInput = z.infer<typeof CreateSessionSchema>;
export type JoinSessionInput = z.infer<typeof JoinSessionSchema>;
export type SubmitAnswerInput = z.infer<typeof SubmitAnswerSchema>;
