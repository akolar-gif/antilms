"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface Module {
  id: string;
  title: string;
}

interface SidebarLinksProps {
  courseId: string;
  modules: Module[];
}

export function SidebarLinks({ courseId, modules }: SidebarLinksProps) {
  const pathname = usePathname();

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-1">
      {modules.map((mod) => {
        const href = `/learner/courses/${courseId}/modules/${mod.id}`;
        const isActive = pathname === href;
        return (
          <Link
            key={mod.id}
            href={href}
            className={`block p-3 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? "bg-royal-blue/10 text-royal-blue"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            {mod.title}
          </Link>
        );
      })}
    </div>
  );
}
