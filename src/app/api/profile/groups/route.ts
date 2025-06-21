import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { ProfileGroup } from "@/models/ProfileGroup";

export async function GET(req: NextRequest) {
  await dbConnect();
  const page = Number(req.nextUrl.searchParams.get("page")) || 1;
  const limit = Number(req.nextUrl.searchParams.get("limit")) || 5;
  const search = req.nextUrl.searchParams.get("search")?.toLowerCase() || "";

  let query:any = {};
  // Nếu search, search theo name hoặc profile name substr
  if (search) {
    query = {
      $or: [
        { name: { $regex: search, $options: "i" } },
        { "profiles.name": { $regex: search, $options: "i" } }
      ]
    };
  }

  const total = await ProfileGroup.countDocuments(query);
  const groups = await ProfileGroup.find(query, { __v: 0 })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  // Tổng số profile theo toàn bộ hệ thống (không phân trang, dựa trên query filter hiện tại)
  const aggregateTotalProfiles = await ProfileGroup.aggregate([
    { $match: query },
    { $project: { count: { $size: "$profiles" } } },
    { $group: { _id: null, total: { $sum: "$count" } } }
  ]);
  const totalProfiles = aggregateTotalProfiles[0]?.total || 0;

  return NextResponse.json({
    groups,
    page,
    total,
    totalProfiles,
    totalPages: Math.ceil(total / limit)
  });
}
