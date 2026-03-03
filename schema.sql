-- Drop existing tables if they exist (wrong naming)
DROP TABLE IF EXISTS "Answer" CASCADE;
DROP TABLE IF EXISTS "Player" CASCADE;
DROP TABLE IF EXISTS "Session" CASCADE;
DROP TABLE IF EXISTS "Choice" CASCADE;
DROP TABLE IF EXISTS "Question" CASCADE;
DROP TABLE IF EXISTS "Quiz" CASCADE;

-- Create quizzes table
CREATE TABLE "quizzes" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Create questions table
CREATE TABLE "questions" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "quizId" TEXT NOT NULL REFERENCES "quizzes"("id") ON DELETE CASCADE,
  "text" TEXT NOT NULL,
  "timerSeconds" INTEGER NOT NULL DEFAULT 20,
  "orderIndex" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Create choices table
CREATE TABLE "choices" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "questionId" TEXT NOT NULL REFERENCES "questions"("id") ON DELETE CASCADE,
  "text" TEXT NOT NULL,
  "isCorrect" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Create sessions table
CREATE TABLE "sessions" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "quizId" TEXT NOT NULL REFERENCES "quizzes"("id") ON DELETE CASCADE,
  "joinCode" TEXT NOT NULL UNIQUE,
  "status" TEXT NOT NULL DEFAULT 'waiting',
  "currentQuestionIndex" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "startedAt" TIMESTAMP(3),
  "endedAt" TIMESTAMP(3)
);

-- Create players table
CREATE TABLE "players" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "sessionId" TEXT NOT NULL REFERENCES "sessions"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "score" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Create answers table
CREATE TABLE "answers" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "playerId" TEXT NOT NULL REFERENCES "players"("id") ON DELETE CASCADE,
  "questionId" TEXT NOT NULL REFERENCES "questions"("id") ON DELETE CASCADE,
  "selectedChoiceId" TEXT NOT NULL REFERENCES "choices"("id") ON DELETE RESTRICT,
  "timeTaken" INTEGER NOT NULL,
  "isCorrect" BOOLEAN NOT NULL DEFAULT false,
  "pointsAwarded" INTEGER NOT NULL DEFAULT 0,
  "sessionId" TEXT NOT NULL REFERENCES "sessions"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX "questions_quizId_idx" ON "questions"("quizId");
CREATE INDEX "choices_questionId_idx" ON "choices"("questionId");
CREATE INDEX "sessions_quizId_idx" ON "sessions"("quizId");
CREATE INDEX "sessions_joinCode_idx" ON "sessions"("joinCode");
CREATE INDEX "players_sessionId_idx" ON "players"("sessionId");
CREATE INDEX "answers_playerId_idx" ON "answers"("playerId");
CREATE INDEX "answers_questionId_idx" ON "answers"("questionId");
CREATE INDEX "answers_sessionId_idx" ON "answers"("sessionId");
