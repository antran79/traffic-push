import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full border-b">
      <div className="max-w-6xl mx-auto px-5 py-4">
        <Link href="/" className="font-bold text-xl tracking-tight">
          Traffic Push
        </Link>
      </div>
    </header>
  );
}
