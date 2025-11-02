import Link from "next/link";
import { ReactNode } from "react";

export default function WidgetCard({ href, title, children }:{
  href: string; title: string; children?: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition p-5 shadow-lg"
    >
      <div className="text-lg font-semibold mb-2">{title}</div>
      <div className="opacity-80 group-hover:opacity-100">{children}</div>
    </Link>
  );
}
