import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import StaffDashboardContainer from "@/components/staff/StaffDashboardContainer";

export const revalidate = 0;

export default async function StaffPage() {
  const user = await getSession();

  if (!user) {
    redirect("/login?redirect=/staff");
  }

  return (
    <div style={{ minHeight: "100%", width: "100%" }}>
      <StaffDashboardContainer user={user} />
    </div>
  );
}
