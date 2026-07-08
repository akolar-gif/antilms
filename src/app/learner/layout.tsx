import { AppShell } from "@/components/layout/app-shell";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function LearnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("user_session")?.value;
  const user = token ? await verifySession(token) : null;

  if (!user) {
    redirect("/login");
  }

  return (
    <AppShell currentRole="learner" currentUser={user}>
      {children}
    </AppShell>
  );
}
