import { NextRequest } from 'next/server';
import { JoinSessionSchema } from '@/lib/validations';
import { handleErrorResponse, successResponse, ApiErrors } from '@/lib/api-errors';
import { prisma } from '@/lib/prisma';
import { isValidCode } from '@/lib/game-logic';
import { broadcastToSession, eventNames } from '@/lib/pusher';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = JoinSessionSchema.parse(body);

    if (!isValidCode(validatedData.code)) {
      throw ApiErrors.INVALID_CODE;
    }

    // Find session
    const session = await prisma.session.findUnique({
      where: { joinCode: validatedData.code },
      include: {
        quiz: {
          include: {
            questions: {
              orderBy: { orderIndex: 'asc' },
              include: {
                choices: {
                  select: {
                    id: true,
                    text: true,
                  },
                },
              },
            },
          },
        },
        players: true,
      },
    });

    if (!session) {
      throw ApiErrors.INVALID_CODE;
    }

    if (session.status !== 'waiting') {
      throw ApiErrors.SESSION_NOT_ACTIVE;
    }

    // Create player
    const player = await prisma.player.create({
      data: {
        sessionId: session.id,
        name: validatedData.playerName,
        score: 0,
      },
    });

    // Broadcast player joined event
    await broadcastToSession(validatedData.code, eventNames.PLAYER_JOINED, {
      playerId: player.id,
      playerName: player.name,
      totalPlayers: session.players.length + 1,
    });

    return successResponse(
      {
        player,
        session: {
          id: session.id,
          joinCode: session.joinCode,
          status: session.status,
          currentQuestionIndex: session.currentQuestionIndex,
          quiz: session.quiz,
        },
      },
      201
    );
  } catch (error) {
    return handleErrorResponse(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { playerId, sessionId } = body;

    if (!playerId || !sessionId) {
      return successResponse({ error: 'playerId and sessionId are required' }, 400);
    }

    // Find the player and session
    const player = await prisma.player.findUnique({
      where: { id: playerId },
      include: {
        session: {
          select: {
            id: true,
            joinCode: true,
          },
        },
      },
    });

    if (!player || player.sessionId !== sessionId) {
      return successResponse({ error: 'Player not found' }, 404);
    }

    // Delete the player
    await prisma.player.delete({
      where: { id: playerId },
    });

    // Broadcast player removed event
    await broadcastToSession(player.session.joinCode, eventNames.PLAYER_REMOVED, {
      playerId: playerId,
      playerName: player.name,
    });

    // Fetch updated session
    const updatedSession = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { players: true },
    });

    return successResponse(
      {
        message: 'Player removed successfully',
        session: updatedSession,
      },
      200
    );
  } catch (error) {
    return handleErrorResponse(error);
  }
}
