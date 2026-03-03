import { NextRequest } from 'next/server';
import { SubmitAnswerSchema } from '@/lib/validations';
import { handleErrorResponse, successResponse } from '@/lib/api-errors';
import { prisma } from '@/lib/prisma';
import { calculatePoints } from '@/lib/game-logic';
import { broadcastToSession, eventNames } from '@/lib/pusher';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = SubmitAnswerSchema.parse(body);

    // Get the session
    const session = await prisma.session.findUnique({
      where: { id: validatedData.sessionId },
      include: {
        quiz: true,
        players: true,
      },
    });

    if (!session) {
      return successResponse({ error: 'Session not found' }, 404);
    }

    // Get the question and selected choice
    const [question, selectedChoice] = await Promise.all([
      prisma.question.findUnique({
        where: { id: validatedData.questionId },
      }),
      prisma.choice.findUnique({
        where: { id: validatedData.selectedChoiceId },
      }),
    ]);

    if (!question || !selectedChoice) {
      return successResponse({ error: 'Invalid question or choice' }, 400);
    }

    // Determine if answer is correct
    const isCorrect = selectedChoice.isCorrect;

    // Calculate points
    const pointsAwarded = calculatePoints(
      isCorrect,
      validatedData.timeTaken,
      question.timerSeconds
    );

    // Create answer record
    const answer = await prisma.answer.create({
      data: {
        playerId: validatedData.playerId,
        questionId: validatedData.questionId,
        selectedChoiceId: validatedData.selectedChoiceId,
        timeTaken: validatedData.timeTaken,
        isCorrect,
        pointsAwarded,
        sessionId: validatedData.sessionId,
      },
    });

    // Update player score
    await prisma.player.update({
      where: { id: validatedData.playerId },
      data: {
        score: {
          increment: pointsAwarded,
        },
      },
    });

    // Get updated leaderboard
    const updatedPlayers = await prisma.player.findMany({
      where: { sessionId: validatedData.sessionId },
      orderBy: { score: 'desc' },
    });

    // Broadcast leaderboard update
    await broadcastToSession(session.joinCode, eventNames.LEADERBOARD_UPDATE, {
      leaderboard: updatedPlayers,
      answerResult: {
        playerId: validatedData.playerId,
        isCorrect,
        pointsAwarded,
      },
    });

    return successResponse(
      {
        answer,
        playerScore: updatedPlayers.find((p: any) => p.id === validatedData.playerId)
          ?.score,
      },
      201
    );
  } catch (error) {
    return handleErrorResponse(error);
  }
}
