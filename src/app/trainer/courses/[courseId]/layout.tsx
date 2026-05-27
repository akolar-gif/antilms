import { store } from "@/lib/store";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SidebarModules } from "@/components/trainer/sidebar-modules";
import { SidebarModuleActions } from "@/components/trainer/sidebar-actions";

export const dynamic = 'force-dynamic';
import { publishCourseAction } from "@/app/actions/course";

export default async function CourseEditorLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const course = await store.getCourse(courseId);
  
  if (!course) {
    notFound();
  }

  const modules = await store.getModules(courseId);

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Left Sidebar: Course Structure */}
      <aside className="w-64 border-r border-slate-200 bg-slate-50 flex flex-col h-full">
        <div className="p-4 border-b border-slate-200">
          <Link href="/trainer" className="text-sm text-slate-500 hover:text-emerald-green mb-2 inline-block">
            ← Back to Courses
          </Link>
          <div className="flex justify-between items-start mb-2">
            <h2 className="font-heading font-bold text-slate-800 line-clamp-2 pr-2">{course.title}</h2>
          </div>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${course.status === 'published' ? 'bg-emerald-green/10 text-emerald-green' : 'bg-slate-200 text-slate-600'}`}>
              {course.status}
            </span>
            {course.status !== "published" && (
              <form action={publishCourseAction.bind(null, course.id)}>
                <button type="submit" className="text-xs font-semibold text-royal-blue hover:underline bg-transparent border-none cursor-pointer">
                  Publish
                </button>
              </form>
            )}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <Link 
            href={`/trainer/courses/${course.id}`}
            className="block p-3 bg-slate-100 border border-transparent rounded-md hover:border-slate-300 transition-all text-sm font-semibold text-slate-700 mb-4"
          >
            ⚙️ Course Settings
          </Link>

          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Modules</div>
          <SidebarModules courseId={course.id} modules={modules} />
          <SidebarModuleActions courseId={course.id} />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex bg-white overflow-hidden">
        {children}
      </main>
    </div>
  );
}
