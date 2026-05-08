import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validators";
import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.parse(body);

    const existing = await db.user.findUnique({ where: { email: parsed.email } });
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(parsed.password, 12);

    const user = await db.user.create({
      data: {
        name: parsed.name,
        email: parsed.email,
        passwordHash: hashedPassword,
      },
      select: { id: true, email: true, name: true },
    });

    return NextResponse.json({ data: { user } }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
