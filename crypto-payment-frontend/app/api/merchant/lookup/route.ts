import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || '';
  const token = request.headers.get('authorization') || '';

  try {
    const res = await fetch(
      `${BACKEND}/merchant/lookup?query=${encodeURIComponent(query)}`,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: token }),
        },
      }
    );

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ message: 'Backend unavailable' }, { status: 503 });
  }
}