import { store } from "@/lib/store";
import { notFound } from "next/navigation";
import { LearnerModuleClient } from "@/components/learner/module-client";

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
  const progress = await store.getUserProgress("learner-1", courseId);
  const reflections = await store.getReflections("learner-1");

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
