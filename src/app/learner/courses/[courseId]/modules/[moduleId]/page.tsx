import { store } from "@/lib/store";
import { notFound } from "next/navigation";
import { LearnerModuleClient } from "@/components/learner/module-client";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";

export const dynamic = 'force-dynamic';

export default async function LearnerModulePage({
  params,
}: {
  params: Promise<{ courseId: string; moduleId: string }>;
}) {
  const { moduleId, courseId } = await params;
  const module = await store.getModules(courseId).then(mods => mods.find(m => m.id === moduleId));
  
  if (!module) {
    notFound();
  }

  const blocks = await store.getBlocks(moduleId);
  
  const cookieStore = await cookies();
  const token = cookieStore.get("user_session")?.value;
  const user = token ? await verifySession(token) : null;
  const userId = user?.id || "learner-1";

  const progress = await store.getUserProgress(userId, courseId);
  const reflections = await store.getReflections(userId);

  return (
    <LearnerModuleClient 
      moduleTitle={module.title}
      moduleDescription={module.description}
      courseId={courseId}
      moduleId={moduleId}
      blocks={blocks}
      completedBlocks={progress.completedBlocks}
      initialReflections={reflections}
    />
  );
}
