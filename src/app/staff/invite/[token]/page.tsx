import { StaffInviteTokenForm } from "@/components/staff/staff-invite-token-form";

export default async function StaffInviteTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <StaffInviteTokenForm token={token} />;
}
