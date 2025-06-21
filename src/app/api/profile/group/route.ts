import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { ProfileGroup } from "@/models/ProfileGroup";

export async function POST(req: NextRequest) {
  await dbConnect();
  const { groupNames } = await req.json();
  if (!Array.isArray(groupNames) || groupNames.length === 0) {
    return NextResponse.json({ error: "Thiếu danh sách tên group." }, { status: 400 });
  }
  const groups = [];
  for (const name of groupNames) {
    if (!name) continue;
    let existed = await ProfileGroup.findOne({ name });
    if (existed) continue;
    let doc = await ProfileGroup.create({ name });
    groups.push(doc);
  }
  return NextResponse.json({ success: true, groups });
}
