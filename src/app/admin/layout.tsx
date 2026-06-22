import { AppShell } from "@/components/layout/app-shell";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("user_session")?.value;
  const user = token ? await verifySession(token) : null;

  return (
    <AppShell currentRole="admin" currentUser={user}>
      {children}
    </AppShell>
  );
}
