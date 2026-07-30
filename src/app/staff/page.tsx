import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import StaffDashboard from "@/components/staff/StaffDashboard";

export const revalidate = 0;

export default async function StaffPage() {
  const user = await getSession();

  if (!user) {
    redirect("/login?redirect=/staff");
  }

  return (
    <div style={{ minHeight: "100%", width: "100%" }}>
      <StaffDashboard user={user} />
    </div>
  );
}
