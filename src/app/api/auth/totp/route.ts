import { NextRequest } from 'next/server';
import speakeasy from 'speakeasy';
import { successResponse, handleErrorResponse } from '@/lib/api-errors';

const TOTP_SECRET = 'JBSWY3DPEHPK3PXP';
const TOTP_DIGITS = 6;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token } = body;

    if (!token || typeof token !== 'string') {
      return successResponse({ error: 'Token is required' }, 400);
    }

    const verified = speakeasy.totp.verify({
      secret: TOTP_SECRET,
      encoding: 'base32',
      token: token,
      digits: TOTP_DIGITS,
      window: 2, // Allow 2 windows of drift
    });

    if (verified) {
      return successResponse({ valid: true });
    } else {
      return successResponse({ valid: false, error: 'Invalid token' }, 401);
    }
  } catch (error) {
    return handleErrorResponse(error);
  }
}
