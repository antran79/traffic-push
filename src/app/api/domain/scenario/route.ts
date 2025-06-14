import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { redisClient } from '@/lib/redis';
import { Domain } from '@/models/Domain';

export async function POST(req: NextRequest) {
  await dbConnect();
  const redis = redisClient();
  const { domain, groupName, description } = await req.json();
  if (!domain || !groupName || !description) {
    return NextResponse.json({ error: 'Yêu cầu thiếu thông tin.' }, { status: 400 });
  }
  // Tìm domain/group
  const doc = await Domain.findOne({ name: domain });
  if (!doc) return NextResponse.json({ error: 'Domain không tồn tại!' }, { status: 400 });
  const group = doc.groups.find(g => g.groupName === groupName);
  if (!group) return NextResponse.json({ error: 'Group không tồn tại trong domain!' }, { status: 400 });
  if (group.scenarios.length > 0) {
    return NextResponse.json({ error: 'Group này đã có kịch bản, không được tạo mới!' }, { status: 400 });
  }
  // Thêm scenario
  const newScenario = {
    description,
    status: 'pending',
    createdAt: new Date(),
  };
  group.scenarios.push(newScenario as any);
  await doc.save();

  // Push processing vào Redis. Dùng hash hoặc list: key: "processing_domains"
  const procKey = 'processing_domains';
  const procValue = JSON.stringify({ domain, group: groupName, description, startedAt: new Date().toISOString() });
  await redis.lpush(procKey, procValue);

  // Sau 2.5s, set status DONE, xóa khỏi Redis processing (mock socket)
  setTimeout(async () => {
    await dbConnect();
    const doc2 = await Domain.findOne({ name: domain });
    if (doc2) {
      const group2 = doc2.groups.find(g => g.groupName === groupName);
      if (group2 && group2.scenarios.length > 0) {
        group2.scenarios[0].status = 'done';
        group2.scenarios[0].result = { ai: 'Đã hoàn thành AI Gen', mock: true };
      }
      await doc2.save();
    }
    // Remove from Redis
    await redis.lrem(procKey, 0, procValue);
  }, 2500);

  return NextResponse.json({ scenario: newScenario });
}
