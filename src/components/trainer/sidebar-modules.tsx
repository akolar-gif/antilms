"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Module } from "@/types";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteModuleAction } from "@/app/actions/course";
import { toast } from "sonner";

interface SidebarModulesProps {
  courseId: string;
  modules: Module[];
}

export function SidebarModules({ courseId, modules }: SidebarModulesProps) {
  const pathname = usePathname();

  const handleDeleteModule = async (moduleId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this module and all its blocks? This cannot be undone.")) {
      const toastId = toast.loading("Deleting module...");
      try {
        await deleteModuleAction(courseId, moduleId);
        toast.success("Module deleted successfully!", { id: toastId });
      } catch (error) {
        toast.error("Failed to delete module", { id: toastId });
      }
    }
  };

  return (
    <div className="space-y-2">
      {modules.map((mod) => {
        const href = `/trainer/courses/${courseId}/modules/${mod.id}`;
        const isActive = pathname === href;
        return (
          <Link
            key={mod.id}
            href={href}
            className={`flex items-center justify-between p-3 rounded-md border shadow-sm transition-all text-sm font-medium group ${
              isActive
                ? "bg-emerald-green/10 border-emerald-green text-emerald-green"
                : "bg-white border-slate-200 text-slate-700 hover:border-emerald-green hover:shadow-md"
            }`}
          >
            <span className="truncate pr-2">{mod.title}</span>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={(e) => handleDeleteModule(mod.id, e)}
              className="opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 w-7 h-7 rounded-lg transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </Link>
        );
      })}
    </div>
  );
}
