import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Domain } from '@/models/Domain';

// Validate chuẩn domain
function validDomain(domain: string) {
  return /^(?!-)[A-Za-z0-9-]{1,63}(?<!-)\.[A-Za-z]{2,}(?:\.[A-Za-z]{2,})*$/.test(domain);
}

export async function GET() {
  await dbConnect();
  const domains = await Domain.find({}, { __v: 0 });
  return NextResponse.json({ domains });
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const { name } = await req.json();
  if (!name || !validDomain(name)) {
    return NextResponse.json({ error: 'Tên miền không hợp lệ.' }, { status: 400 });
  }
  const existed = await Domain.findOne({ name });
  if (existed) {
    return NextResponse.json({ error: 'Domain đã tồn tại.' }, { status: 400 });
  }
  const created = await Domain.create({ name });
  return NextResponse.json({ domain: created });
}
