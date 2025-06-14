import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import {
  SquareStack,
  UserSquare,
  Share2,
  FolderKanban,
  UsersRound,
  Server,
} from "lucide-react";

// Mỗi card: màu border/icon/bg của icon
const CARD_DATA = [
  {
    title: "Domains",
    href: "/domain",
    icon: SquareStack,
    iconClass: "",
    border: "border-blue-200",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-500",
    description: "Quản lý domain, quản lý kịch bản."
  },
  {
    title: "Profiles",
    href: "/profiles",
    icon: UserSquare,
    iconClass: "",
    border: "border-pink-200",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-500",
    description: "Quản lý profile."
  },
  {
    title: "Proxies",
    href: "/proxies",
    icon: Share2,
    iconClass: "",
    border: "border-emerald-200",
    iconBg: "bg-green-100",
    iconColor: "text-green-500",
    description: "Quản lý Proxies."
  },
  {
    title: "Jobs",
    href: "/jobs",
    icon: FolderKanban,
    iconClass: "",
    border: "border-amber-200",
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-600",
    description: "Quản lý tất cả các jobs."
  },
  {
    title: "Workers",
    href: "/workers",
    icon: UsersRound,
    iconClass: "",
    border: "border-purple-200",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-500",
    description: "Quản lý các worker đang sử dụng."
  },
  {
    title: "Systems",
    href: "/systems",
    icon: Server,
    iconClass: "",
    border: "border-slate-200",
    iconBg: "bg-slate-100",
    iconColor: "text-slate-500",
    description: "Các thông tin của server."
  },
];

export default function Home() {
  return (
    <main className="px-2 py-8 max-w-6xl mx-auto">
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CARD_DATA.map((card) => (
          <Link href={card.href} key={card.title}>
            <Card
              className={`border ${card.border} hover:shadow-md transition cursor-pointer h-full rounded-2xl bg-white flex items-center px-5 py-4`}
            >
              <CardContent className="flex items-center p-0 gap-4">
                <div className={`flex items-center justify-center ${card.iconBg} ${card.iconColor} rounded-xl w-12 h-12 ${card.iconClass}`}>
                  <card.icon className="w-6 h-6" fill="currentColor" stroke="none" />
                </div>
                <div className="flex flex-col justify-center min-w-0">
                  <div className="font-bold text-lg text-gray-900 mb-1 truncate">{card.title}</div>
                  <div className="text-gray-600 text-sm truncate">{card.description}</div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>
    </main>
  );
}
