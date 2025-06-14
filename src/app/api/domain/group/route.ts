import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Domain } from '@/models/Domain';

export async function POST(req: NextRequest) {
  await dbConnect();
  const { domain, groupNames } = await req.json();
  if (!domain || !Array.isArray(groupNames) || groupNames.length === 0) {
    return NextResponse.json({ error: 'Thiếu tên domain hoặc group.' }, { status: 400 });
  }
  const doc = await Domain.findOne({ name: domain });
  if (!doc) {
    return NextResponse.json({ error: 'Domain không tồn tại.' }, { status: 400 });
  }
  const groupExist = doc.groups.map(g => g.groupName);
  const errors: string[] = [];
  const toAdd: string[] = [];
  for (let gname of groupNames) {
    if (!gname) errors.push('Không được để trống tên group.');
    else if (groupExist.includes(gname)) errors.push(`Group "${gname}" đã tồn tại trong domain.`);
    else toAdd.push(gname);
  }
  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join(' ') }, { status: 400 });
  }
  // Thêm group
  for (let gname of toAdd) {
    doc.groups.push({ groupName: gname });
  }
  await doc.save();
  return NextResponse.json({ domain: doc });
}
