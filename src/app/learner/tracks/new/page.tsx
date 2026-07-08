import { store } from "@/lib/store";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { TrackBuilderClient } from "@/components/learner/track-builder-client";
import { verifySession } from "@/lib/session";

export const dynamic = 'force-dynamic';

export default async function NewTrackPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("user_session")?.value;
  const user = token ? await verifySession(token) : null;

  // Protect route
  if (!user || (user.role !== "learner" && user.role !== "admin")) {
    redirect("/login");
  }

  const allCourses = await store.getCourses();
  // Filter for published sprints
  const sprints = allCourses.filter(c => c.type === "sprint" && c.status === "published");

  return (
    <div className="flex-1 bg-paper min-h-[calc(100vh-4rem)] p-6">
      <TrackBuilderClient sprints={sprints} />
    </div>
  );
}
