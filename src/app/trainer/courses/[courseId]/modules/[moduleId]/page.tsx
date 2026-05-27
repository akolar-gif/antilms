import { store } from "@/lib/store";
import { notFound } from "next/navigation";
import { ModuleEditorClient } from "@/components/trainer/module-editor-client";

export default async function ModuleEditorPage({
  params,
}: {
  params: Promise<{ courseId: string; moduleId: string }>;
}) {
  const { moduleId, courseId } = await params;
  const course = await store.getCourse(courseId);
  const module = await store.getModules(courseId).then(mods => mods.find(m => m.id === moduleId));
  
  if (!module || !course) {
    notFound();
  }

  const blocks = await store.getBlocks(moduleId);

  return (
    <>
      <ModuleEditorClient 
        course={course} 
        module={module} 
        initialBlocks={blocks} 
      />
    </>
  );
}
