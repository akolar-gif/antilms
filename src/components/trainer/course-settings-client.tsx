"use client";

import { useState } from "react";
import { Course } from "@/types";
import { Button } from "@/components/ui/button";
import { updateCourseSettingsAction } from "@/app/actions/course";
import { ImagePicker } from "@/components/trainer/image-picker";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function CourseSettingsClient({ course }: { course: Course }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 p-8">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-heading font-bold text-slate-800 mb-6">Course Settings</h2>
        
        <form 
          action={async (formData) => {
            setIsLoading(true);
            const toastId = toast.loading("Updating settings...");
            try {
              await updateCourseSettingsAction(formData);
              toast.success("Settings updated successfully!", { id: toastId });
              router.refresh();
            } catch (e) {
              toast.error("Failed to update settings", { id: toastId });
            } finally {
              setIsLoading(false);
            }
          }}
          className="bg-white p-6 rounded-xl shadow-sm border border-slate-200"
        >
          <input type="hidden" name="courseId" value={course.id} />
          
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">Course Title</label>
              <input 
                type="text" 
                id="title" 
                name="title" 
                required 
                defaultValue={course.title}
                className="w-full p-2 border border-slate-200 rounded-md outline-none focus:border-emerald-green focus:ring-1 focus:ring-emerald-green transition-all"
              />
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">Category / Rubrik</label>
              <input 
                type="text" 
                id="category" 
                name="category" 
                defaultValue={course.category}
                className="w-full p-2 border border-slate-200 rounded-md outline-none focus:border-emerald-green focus:ring-1 focus:ring-emerald-green transition-all"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea 
                id="description" 
                name="description" 
                required 
                rows={4}
                defaultValue={course.description}
                className="w-full p-2 border border-slate-200 rounded-md outline-none focus:border-emerald-green focus:ring-1 focus:ring-emerald-green transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Update Cover Image</label>
              {course.imageUrl && (
                <div className="mb-4">
                  <p className="text-xs text-slate-500 mb-1">Current Image:</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={course.imageUrl} alt="Current cover" className="w-48 h-32 object-cover rounded-md border border-slate-200" />
                </div>
              )}
              <ImagePicker />
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
