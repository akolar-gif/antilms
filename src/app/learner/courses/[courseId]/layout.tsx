import { store } from "@/lib/store";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SidebarLinks } from "@/components/learner/sidebar-links";

export default async function LearnerCourseLayout({
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
  const progress = await store.getUserProgress("learner-1", courseId);

  let totalBlocks = 0;
  let completedBlocks = 0;
  for (const mod of modules) {
    const blocks = await store.getBlocks(mod.id);
    totalBlocks += blocks.length;
    completedBlocks += blocks.filter(b => progress.completedBlocks.includes(b.id)).length;
  }
  const progressPercentage = totalBlocks > 0 
    ? Math.min(100, Math.round((completedBlocks / totalBlocks) * 100)) 
    : 0;

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Learner Sidebar (Optional, maybe collapsible later) */}
      <aside className="w-64 border-r border-slate-200 bg-white flex flex-col h-full hidden md:flex">
        <div className="p-6 border-b border-slate-100">
          <Link href="/learner" className="text-sm text-slate-500 hover:text-royal-blue mb-4 inline-block">
            ← Dashboard
          </Link>
          <h2 className="font-heading font-bold text-slate-800 line-clamp-2">{course.title}</h2>
          
          <div className="mt-4">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Progress</span>
              <span>{progressPercentage}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-royal-blue h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${Math.max(0, Math.min(100, progressPercentage))}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        <SidebarLinks courseId={course.id} modules={modules} />
      </aside>

      {/* Main Learning Area */}
      <main className="flex-1 flex bg-slate-50 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
