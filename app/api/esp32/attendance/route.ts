import { NextRequest, NextResponse } from 'next/server';
import { getRecentSessionAttendance, markAttendanceOnce } from '@/lib/attendance-station';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Device-Key',
};

function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: corsHeaders,
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');
  const limit = Number(searchParams.get('limit') ?? '12');

  if (!sessionId) {
    return json({ error: 'sessionId is required.' }, 400);
  }

  try {
    const events = await getRecentSessionAttendance(sessionId, limit);
    return json({
      sessionId,
      events,
      station: {
        mode: 'esp32-cam',
        streamUrl: process.env.NEXT_PUBLIC_ESP32_STREAM_URL ?? null,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load ESP32 attendance feed.';
    return json({ error: message }, 500);
  }
}

export async function POST(request: NextRequest) {
  const configuredKey = process.env.ESP32_DEVICE_SECRET;
  const providedKey = request.headers.get('x-device-key');

  if (configuredKey && providedKey !== configuredKey) {
    return json({ error: 'Unauthorized device.' }, 401);
  }

  try {
    const body = await request.json();
    const sessionId = body.sessionId ?? body.session_id;

    if (!sessionId) {
      return json({ error: 'sessionId is required.' }, 400);
    }

    const result = await markAttendanceOnce({
      profileId: body.profileId ?? body.profile_id ?? null,
      recognizedName: body.recognizedName ?? body.recognized_name ?? null,
      sessionId,
      classId: body.classId ?? body.class_id ?? null,
      confidenceScore:
        typeof body.confidenceScore === 'number'
          ? body.confidenceScore
          : typeof body.confidence_score === 'number'
            ? body.confidence_score
            : null,
    });

    return json(result, result.status === 'marked' ? 201 : 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to process ESP32 attendance.';
    return json({ error: message }, 500);
  }
}
