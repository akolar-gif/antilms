"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Module } from "@/types";
import { Trash2 } from "lucide-react";
import { deleteModuleAction } from "@/app/actions/course";
import { toast } from "sonner";
import { useTranslation } from "@/components/layout/language-context";

interface SidebarModulesProps {
  courseId: string;
  modules: Module[];
}

export function SidebarModules({ courseId, modules }: SidebarModulesProps) {
  const pathname = usePathname();
  const { t } = useTranslation();

  const handleDeleteModule = async (moduleId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(t("sidebar_modules.confirm_delete"))) {
      const toastId = toast.loading(t("sidebar_modules.toast_deleting"));
      try {
        await deleteModuleAction(courseId, moduleId);
        toast.success(t("sidebar_modules.toast_deleted"), { id: toastId });
      } catch (error) {
        toast.error(t("sidebar_modules.toast_delete_failed"), { id: toastId });
      }
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {modules.map((mod) => {
        const href = `/trainer/courses/${courseId}/modules/${mod.id}`;
        const isActive = pathname === href;
        return (
          <Link
            key={mod.id}
            href={href}
            className="flex items-center justify-between p-3 rounded-xl border text-xs font-mono uppercase tracking-wider transition-all group"
            style={{
              background: isActive ? "var(--ink)" : "var(--paper)",
              borderColor: isActive ? "var(--ink)" : "var(--line)",
              color: isActive ? "var(--paper)" : "var(--ink)",
              boxShadow: "none"
            }}
          >
            <span className="truncate pr-2 font-bold">{mod.title}</span>
            <button
              type="button"
              onClick={(e) => handleDeleteModule(mod.id, e)}
              className="opacity-0 group-hover:opacity-100 hover:bg-red-550 transition-all p-1 rounded-md"
              style={{
                border: "none",
                background: "none",
                cursor: "pointer",
                color: isActive ? "color-mix(in oklab, var(--paper) 60%, transparent)" : "var(--ink-3)",
              }}
            >
              <Trash2 className="w-3.5 h-3.5 hover:text-red-500 transition-colors" />
            </button>
          </Link>
        );
      })}
    </div>
  );
}
