import { store } from "@/lib/store";
import { CreateCourseForm } from "@/components/trainer/create-course-form";
import { CourseListClient } from "@/components/trainer/course-list-client";
import { logoutAction } from "@/app/actions/auth";
import { LogOut } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function TrainerDashboard() {
  const courses = await store.getCourses();

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-emerald-green mb-2">Trainer Studio</h1>
          <p className="text-slate-600">Compose intelligent learning journeys.</p>
        </div>
        <div className="flex items-center gap-3">
          <form action={logoutAction}>
            <button 
              type="submit" 
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 text-sm font-semibold transition-all shadow-sm active:scale-[0.98]"
            >
              <LogOut className="w-4 h-4" /> Abmelden
            </button>
          </form>
          <CreateCourseForm />
        </div>
      </div>

      <CourseListClient courses={courses} role="trainer" />
    </div>
  );
}
