import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Domain } from '@/models/Domain';

export async function POST(req: NextRequest) {
  await dbConnect();
  const { domain, groupName, scenario } = await req.json();
  if (!domain || !groupName || !scenario) {
    return NextResponse.json({ error: 'Thiếu thông tin domain/groupName/scenario.' }, { status: 400 });
  }
  const doc = await Domain.findOne({ name: domain });
  if (!doc) return NextResponse.json({ error: 'Domain không tồn tại!' }, { status: 400 });
  const group = doc.groups.find((g: any) => g.groupName === groupName);
  if (!group) return NextResponse.json({ error: 'Group không tồn tại trong domain!' }, { status: 400 });
  if (group.scenarios.length > 0) {
    return NextResponse.json({ error: 'Group này đã có kịch bản, không được ghi đè!' }, { status: 400 });
  }
  // Nhận mảng scenario
  if (!Array.isArray(scenario) || scenario.length === 0) {
    return NextResponse.json({ error: 'Phải upload một mảng JSON các kịch bản AI >= 1 phần tử!' }, { status: 400 });
  }
  // Validate từng object trong array
  for (let s of scenario) {
    if (typeof s !== 'object' || !s.description) {
      return NextResponse.json({ error: 'Từng kịch bản trong file phải có field description!' }, { status: 400 });
    }
  }
  // Ghi các scenario với status:done, createdAt mới
  for (const s of scenario) {
    group.scenarios.push({ ...s, status: 'done', createdAt: new Date() });
  }
  await doc.save();
  return NextResponse.json({ success: true, domain, groupName, importedCount: scenario.length });
}
