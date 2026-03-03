import { NextRequest } from 'next/server';
import { handleErrorResponse, successResponse, ApiErrors } from '@/lib/api-errors';
import { prisma } from '@/lib/prisma';
import { isValidCode } from '@/lib/game-logic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    if (!isValidCode(code)) {
      throw ApiErrors.INVALID_CODE;
    }

    const session = await prisma.session.findUnique({
      where: { joinCode: code },
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
        players: {
          orderBy: { score: 'desc' },
        },
      },
    });

    if (!session) {
      throw ApiErrors.INVALID_CODE;
    }

    return successResponse(session);
  } catch (error) {
    return handleErrorResponse(error);
  }
}
