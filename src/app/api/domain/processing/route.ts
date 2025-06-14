import { NextRequest, NextResponse } from 'next/server';
import { redisClient } from '@/lib/redis';

export async function GET() {
  const redis = redisClient();
  const procKey = 'processing_domains';
  const values = await redis.lrange(procKey, 0, -1);
  // Mỗi phần tử là JSON.stringify({domain, group, description, startedAt})
  const processing = values.map(v => {
    try { return JSON.parse(v); } catch { return null; }
  }).filter(Boolean);
  return NextResponse.json({ processing });
}
