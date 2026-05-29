import { store } from "@/lib/store";
import { CreateCourseForm } from "@/components/trainer/create-course-form";
import { CourseListClient } from "@/components/trainer/course-list-client";

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function TrainerDashboard({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const autoCreate = resolvedSearchParams?.create === "true";
  const courses = await store.getCourses();

  return (
    <div className="screen">
      {/* TopBar Header */}
      <header className="topbar">
        <div className="tb-left">
          <div>
            <div className="eyebrow">TRAINER STUDIO</div>
            <div style={{ fontFamily: "var(--f-display)", fontWeight: 800, fontSize: 18, marginTop: 2, textTransform: "uppercase", letterSpacing: "-.01em" }}>
              Studio Workspace
            </div>
          </div>
        </div>
      </header>

      {/* Hero Lattice Grid */}
      <div className="lattice" style={{ gridTemplateColumns: "1fr" }}>
        <div className="cell">
          <div className="eyebrow" style={{ marginBottom: 14 }}>
            STUDIO WORKSPACE · {courses.length} KURSE INSGESAMT
          </div>
          <h1 className="display" style={{ fontSize: "clamp(36px, 5vw, 72px)" }}>Trainer Studio</h1>
          <p className="lede" style={{ maxWidth: 560, marginTop: 18 }}>
            Entwirf intelligente, KI-gestützte Lernjourneys. Nutze den Curriculum-Wizard, um in Sekundenschnelle vollständige Module zu generieren.
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 24, flexWrap: "wrap", alignItems: "center" }}>
            <CreateCourseForm initialOpen={autoCreate} />
          </div>
        </div>
      </div>

      {/* Course List Section */}
      <div className="sec-head">
        <h2>Deine Lernpfade</h2>
        <span className="meta">№ {String(courses.length).padStart(2, "0")} KURSE</span>
      </div>

      <CourseListClient courses={courses} role="trainer" />
    </div>
  );
}

