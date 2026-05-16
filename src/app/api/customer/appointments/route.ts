import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Giriş yapmanız gerekiyor" }, { status: 401 });
  }

  const userEmail = session.user.email;

  // Find all customer records that match the logged-in user's email (across orgs)
  const customers = await db.customer.findMany({
    where: { email: userEmail },
    select: { id: true },
  });

  if (customers.length === 0) {
    return NextResponse.json({ data: [] });
  }

  const customerIds = customers.map((c) => c.id);

  const appointments = await db.appointment.findMany({
    where: { customerId: { in: customerIds } },
    select: {
      id: true,
      startTime: true,
      endTime: true,
      status: true,
      notes: true,
      organization: { select: { name: true, slug: true } },
      service: { select: { name: true, durationMinutes: true, priceCents: true } },
      staff: { select: { name: true } },
    },
    orderBy: { startTime: "desc" },
    take: 100,
  });

  return NextResponse.json({ data: appointments });
}
