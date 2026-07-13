import { store } from "@/lib/store";
import { notFound, redirect } from "next/navigation";
import { ModuleEditorClient } from "@/components/trainer/module-editor-client";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";

export default async function ModuleEditorPage({
  params,
}: {
  params: Promise<{ courseId: string; moduleId: string }>;
}) {
  const { moduleId, courseId } = await params;
  const course = await store.getCourse(courseId);
  
  if (!course) {
    notFound();
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("user_session")?.value;
  const user = token ? await verifySession(token) : null;
  const currentUserId = user?.id || "";
  const isOwner = !course.createdBy || course.createdBy === "Trainer" || course.createdBy === currentUserId;

  if (!isOwner) {
    redirect(`/trainer/courses/${courseId}`);
  }

  const module = await store.getModules(courseId).then(mods => mods.find(m => m.id === moduleId));
  if (!module) {
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
