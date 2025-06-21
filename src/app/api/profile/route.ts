import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { ProfileGroup } from "@/models/ProfileGroup";

export async function POST(req: NextRequest) {
  await dbConnect();
  const { groupId, profiles } = await req.json();
  if (!groupId || !Array.isArray(profiles) || profiles.length === 0) {
    return NextResponse.json({ error: "Thiếu groupId hoặc danh sách profiles." }, { status: 400 });
  }
  const doc = await ProfileGroup.findById(groupId);
  if (!doc) return NextResponse.json({ error: "Không tìm thấy group!" }, { status: 404 });
  // Validate dữ liệu cơ bản từng profile
  for (const p of profiles) {
    if (!p.name || !p.userAgent) {
      return NextResponse.json({ error: "Profile phải có name và userAgent." }, { status: 400 });
    }
  }
  for (const p of profiles) {
    doc.profiles.push(p);
  }
  await doc.save();
  return NextResponse.json({ success: true, group: doc });
}
