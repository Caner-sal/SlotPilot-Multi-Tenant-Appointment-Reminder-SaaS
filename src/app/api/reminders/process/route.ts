import { requireAuth, TenantError } from "@/lib/tenant";
import { processPendingReminders } from "@/services/reminder.service";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const workerKey = req.headers.get("x-worker-key");
    const validWorkerKey = process.env.WORKER_SECRET_KEY;

    if (workerKey && validWorkerKey && workerKey === validWorkerKey) {
      const stats = await processPendingReminders();
      return NextResponse.json({ data: stats });
    }

    await requireAuth();

    const stats = await processPendingReminders();
    return NextResponse.json({ data: stats });
  } catch (err) {
    if (err instanceof TenantError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
