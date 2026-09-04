import { getStaffUsersAction } from "@/lib/actions/users";
import { StaffManager } from "@/components/dashboard/StaffManager";

export const dynamic = "force-dynamic";

export default async function PersonalPage() {
  const staff = await getStaffUsersAction();
  return <StaffManager initialUsers={staff} />;
}
