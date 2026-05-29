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
    <div className="flex-1 overflow-y-auto p-4 space-y-1 bg-paper-2">
      {modules.map((mod) => {
        const href = `/learner/courses/${courseId}/modules/${mod.id}`;
        const isActive = pathname === href;
        return (
          <Link
            key={mod.id}
            href={href}
            className={`block p-3 rounded-xl text-xs font-mono uppercase tracking-wider transition-colors ${
              isActive
                ? "bg-ink text-paper"
                : "text-ink-2 hover:bg-paper-3 hover:text-ink"
            }`}
          >
            {mod.title}
          </Link>
        );
      })}
    </div>
  );
}
