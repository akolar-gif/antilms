import { store } from "@/lib/store";
import { notFound } from "next/navigation";
import { CourseSettingsClient } from "@/components/trainer/course-settings-client";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";

export default async function CourseEditorPage({
  params,
}: {
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
  const currentUserId = user?.id || "";
  const isOwner = !course.createdBy || course.createdBy === "Trainer" || course.createdBy === currentUserId;

  return <CourseSettingsClient course={course} readOnly={!isOwner} />;
}
