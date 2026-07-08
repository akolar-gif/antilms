import { store } from "@/lib/store";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SidebarLinks } from "@/components/learner/sidebar-links";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";

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

  const cookieStore = await cookies();
  const token = cookieStore.get("user_session")?.value;
  const user = token ? await verifySession(token) : null;
  const userId = user?.id || "learner-1";

  const modules = await store.getModules(courseId);
  const progress = await store.getUserProgress(userId, courseId);

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
    <div className="flex h-screen bg-paper overflow-hidden">
      {/* Learner Sidebar */}
      <aside className="w-64 border-r border-line bg-paper-2 flex flex-col h-full hidden md:flex">
        <div className="p-6 border-b border-line">
          <Link href="/learner" className="text-xs font-mono uppercase tracking-wider text-ink-3 hover:text-ink mb-4 inline-block">
            ← Dashboard
          </Link>
          <h2 className="font-heading font-extrabold text-ink text-lg leading-tight">{course.title}</h2>
          
          <div className="mt-4">
            <div className="flex justify-between text-[10px] font-mono uppercase tracking-wider text-ink-3 mb-1">
              <span>Progress</span>
              <span>{progressPercentage}%</span>
            </div>
            <div className="w-full bg-paper-3 rounded-full h-1 overflow-hidden">
              <div 
                className="bg-ink h-1 rounded-full transition-all duration-500" 
                style={{ width: `${Math.max(0, Math.min(100, progressPercentage))}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        <SidebarLinks courseId={course.id} modules={modules} />
      </aside>

      {/* Main Learning Area */}
      <main className="flex-1 flex bg-paper overflow-hidden">
        {children}
      </main>
    </div>
  );
}
