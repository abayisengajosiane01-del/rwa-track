import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, generateToken, setAuthCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, phone } = await request.json();

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, firstName, lastName, phone, role: "WORKER" },
    });

    const token = await generateToken({ userId: user.id, email: user.email, role: user.role });
    await setAuthCookie(token);

    return NextResponse.json({
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
      token,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
  }
}
