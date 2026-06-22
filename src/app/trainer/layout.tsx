import { AppShell } from "@/components/layout/app-shell";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";

export default async function TrainerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("user_session")?.value;
  const user = token ? await verifySession(token) : null;

  return (
    <AppShell currentRole="trainer" currentUser={user}>
      {children}
    </AppShell>
  );
}
