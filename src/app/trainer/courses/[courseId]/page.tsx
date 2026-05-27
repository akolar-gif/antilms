import { store } from "@/lib/store";
import { notFound } from "next/navigation";
import { CourseSettingsClient } from "@/components/trainer/course-settings-client";

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

  return <CourseSettingsClient course={course} />;
}
