import { store } from "@/lib/store";
import { redirect } from "next/navigation";

export default async function LearnerCoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const modules = await store.getModules(courseId);
  
  if (modules.length > 0) {
    // Automatically start with the first module
    redirect(`/learner/courses/${courseId}/modules/${modules[0].id}`);
  }

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-royal-blue/10 text-royal-blue rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
          🚀
        </div>
        <h3 className="text-xl font-heading font-bold text-slate-800 mb-2">Welcome to your journey</h3>
        <p className="text-slate-500">
          The trainer is still preparing the first modules for you. Please check back later!
        </p>
      </div>
    </div>
  );
}
