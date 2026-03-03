import { NextRequest } from 'next/server';
import { CreateSessionSchema } from '@/lib/validations';
import { handleErrorResponse, successResponse, ApiErrors } from '@/lib/api-errors';
import { prisma } from '@/lib/prisma';
import { generateJoinCode } from '@/lib/game-logic';
import { broadcastToSession } from '@/lib/pusher';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = CreateSessionSchema.parse(body);

    // Verify quiz exists
    const quiz = await prisma.quiz.findUnique({
      where: { id: validatedData.quizId },
      include: { questions: { orderBy: { orderIndex: 'asc' } } },
    });

    if (!quiz) {
      throw ApiErrors.QUIZ_NOT_FOUND;
    }

    // Generate unique join code
    let joinCode: string = '';
    let isUnique = false;
    while (!isUnique) {
      joinCode = generateJoinCode();
      const existing = await prisma.session.findUnique({
        where: { joinCode },
      });
      isUnique = !existing;
    }

    // Create session
    const session = await prisma.session.create({
      data: {
        quizId: validatedData.quizId,
        joinCode: joinCode,
        status: 'waiting',
        currentQuestionIndex: 0,
      },
      include: {
        quiz: {
          include: {
            questions: {
              orderBy: { orderIndex: 'asc' },
              include: { choices: true },
            },
          },
        },
        players: true,
      },
    });

    return successResponse(session, 201);
  } catch (error) {
    return handleErrorResponse(error);
  }
}
