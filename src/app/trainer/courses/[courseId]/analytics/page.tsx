import { store } from "@/lib/store";
import { notFound } from "next/navigation";
import { CourseAnalyticsClient } from "@/components/trainer/course-analytics-client";

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ courseId: string }>;
}

export default async function CourseAnalyticsPage({ params }: PageProps) {
  const { courseId } = await params;

  const course = await store.getCourse(courseId);
  if (!course) {
    notFound();
  }

  // Fetch modules and blocks of this course
  const modules = await store.getModules(courseId);
  const moduleIds = modules.map(m => m.id);
  
  // Fetch blocks for all modules in parallel
  const blocksPromises = moduleIds.map(id => store.getBlocks(id));
  const blocksNested = await Promise.all(blocksPromises);
  const blocks = blocksNested.flat();

  // Fetch progress data and reflections
  const progressData = await store.getCourseProgress(courseId);
  const reflections = await store.getCourseReflections(courseId);

  return (
    <CourseAnalyticsClient
      course={course}
      modules={modules}
      blocks={blocks}
      progressData={progressData}
      reflections={reflections}
    />
  );
}
