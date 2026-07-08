import { cookies } from "next/headers";
import { store } from "@/lib/store";
import { testAiConnectionAction } from "@/app/actions/ai";
import { AdminPanelClient } from "@/components/admin/admin-panel-client";

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("lang")?.value || "de") as "de" | "en";

  const aiStatus = await testAiConnectionAction();
  const users = await store.getUsers();
  const adminEmail = await store.getSystemSetting("admin_notification_email", "andreas@kolar.biz");

  return (
    <AdminPanelClient 
      initialUsers={users} 
      adminEmail={adminEmail} 
      aiStatus={aiStatus} 
      lang={lang} 
    />
  );
}
