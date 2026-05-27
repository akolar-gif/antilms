"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createCourseAction, generateCurriculumAction } from "@/app/actions/course";
import { uploadImageAction } from "@/app/actions/upload";
import { ImagePicker } from "@/components/trainer/image-picker";
import { CurriculumWizard } from "./curriculum-wizard";
import { GeneratedCurriculumResult } from "@/lib/ai/provider";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

export function CreateCourseForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generateWithAI, setGenerateWithAI] = useState(false);
  const [generatedCurriculum, setGeneratedCurriculum] = useState<GeneratedCurriculumResult | null>(null);
  const [tempCourseData, setTempCourseData] = useState<any>(null);

  if (!isOpen) {
    return <Button onClick={() => setIsOpen(true)}>Create Course</Button>;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const stockImageUrl = formData.get("stockImageUrl") as string;
    const courseImage = formData.get("courseImage") as File | null;

    if (!title || !description) {
      toast.error("Title and description are required.");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading(generateWithAI ? "Generating AI curriculum..." : "Creating course...");

    try {
      let finalImageUrl: string | undefined = undefined;

      // Process uploaded file if present
      if (courseImage && courseImage.size > 0) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", courseImage);
        finalImageUrl = await uploadImageAction(uploadFormData);
      } else if (stockImageUrl) {
        finalImageUrl = stockImageUrl;
      }

      if (generateWithAI) {
        // Call server action to generate modules & blocks
        const curriculum = await generateCurriculumAction(title, description);
        setTempCourseData({ title, description, category, imageUrl: finalImageUrl });
        setGeneratedCurriculum(curriculum);
        toast.success("AI Curriculum generated! Opening wizard...", { id: toastId });
      } else {
        // Call server action to create a simple draft course
        await createCourseAction(formData);
        toast.success("Course created successfully!", { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error(generateWithAI ? "AI curriculum generation failed. Please try again." : "Failed to create course", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form 
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 min-w-[300px] sm:min-w-[400px] absolute right-0 top-12 z-50 animate-in fade-in slide-in-from-top-4"
      >
        <h3 className="text-lg font-heading font-semibold text-slate-800 mb-4">New Learning Journey</h3>
        
        <div className="space-y-4 mb-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">Course Title</label>
            <input 
              type="text" 
              id="title" 
              name="title" 
              required 
              placeholder="e.g. Agile Leadership Basics"
              className="w-full p-2 border border-slate-200 rounded-md outline-none focus:border-emerald-green focus:ring-1 focus:ring-emerald-green transition-all"
            />
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">Category / Rubrik</label>
            <input 
              type="text" 
              id="category" 
              name="category" 
              placeholder="e.g. Leadership, Technology, Soft Skills..."
              className="w-full p-2 border border-slate-200 rounded-md outline-none focus:border-emerald-green focus:ring-1 focus:ring-emerald-green transition-all"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea 
              id="description" 
              name="description" 
              required 
              rows={3}
              placeholder="Brief overview of what learners will achieve..."
              className="w-full p-2 border border-slate-200 rounded-md outline-none focus:border-emerald-green focus:ring-1 focus:ring-emerald-green transition-all resize-none"
            />
          </div>

          {/* AI Toggle Option */}
          <div className="flex items-center space-x-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <input 
              type="checkbox" 
              id="generateWithAI" 
              checked={generateWithAI}
              onChange={(e) => setGenerateWithAI(e.target.checked)}
              className="w-4 h-4 text-emerald-green border-slate-300 rounded focus:ring-emerald-green cursor-pointer"
            />
            <label htmlFor="generateWithAI" className="text-sm font-semibold text-slate-800 flex items-center gap-1.5 cursor-pointer select-none">
              <Sparkles className="w-4 h-4 text-emerald-green animate-pulse" />
              Co-Design Curriculum with Anka AI
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Course Cover Image</label>
            <ImagePicker />
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (generateWithAI ? "Generating..." : "Creating...") : (generateWithAI ? "Generate Journey" : "Create & Enter Studio")}
          </Button>
        </div>
      </form>

      {generatedCurriculum && tempCourseData && (
        <CurriculumWizard
          courseData={tempCourseData}
          initialCurriculum={generatedCurriculum}
          onCancel={() => {
            setGeneratedCurriculum(null);
            setTempCourseData(null);
          }}
        />
      )}
    </>
  );
}
