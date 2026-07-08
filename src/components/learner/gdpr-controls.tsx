"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { clearUserDataAction } from "@/app/actions/progress";
import { ShieldAlert, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/components/layout/language-context";

interface GDPRControlsProps {
  userId: string;
  reflections: any[];
  completedBlocksCount: number;
}

export function GDPRControls({ userId, reflections, completedBlocksCount }: GDPRControlsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { t } = useTranslation();

  const handleExport = () => {
    try {
      const dataStr = JSON.stringify({
        userId,
        exportedAt: new Date().toISOString(),
        reflections,
        completedBlocksCount,
        note: "This export contains all your reflections and progress tracking in compliance with GDPR / DSGVO regulations."
      }, null, 2);

      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `innoversity_learner_data_${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      toast.success(t("gdpr.export_success"));
    } catch (e) {
      toast.error(t("gdpr.export_failed"));
    }
  };

  const handleDelete = async () => {
    if (confirm(t("gdpr.confirm_delete"))) {
      setIsDeleting(true);
      const toastId = toast.loading(t("gdpr.clearing_data"));
      try {
        await clearUserDataAction();
        toast.success(t("gdpr.deleted_success"), { id: toastId });
        window.location.reload();
      } catch (error) {
        toast.error(t("gdpr.deleted_failed"), { id: toastId });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mt-12">
      <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
        <ShieldAlert className="w-5 h-5 text-slate-500" />
        <h3 className="font-heading font-bold text-slate-800 text-lg">{t("gdpr.title")}</h3>
      </div>
      <p className="text-slate-600 text-sm mb-6 leading-relaxed">
        {t("gdpr.desc")}
      </p>
      
      <div className="flex flex-wrap gap-4">
        <Button 
          variant="outline" 
          onClick={handleExport}
          className="text-slate-700 hover:text-royal-blue border-slate-200 hover:bg-royal-blue/5 gap-2 text-xs"
        >
          <Download className="w-4 h-4" /> {t("gdpr.export_btn")}
        </Button>
        <Button 
          variant="ghost" 
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-red-500 hover:text-red-600 hover:bg-red-50 gap-2 text-xs"
        >
          <Trash2 className="w-4 h-4" /> {t("gdpr.delete_btn")}
        </Button>
      </div>
    </div>
  );
}
