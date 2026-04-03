import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, generateToken, setAuthCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await verifyPassword(password, user.password))) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (user.status !== "ACTIVE") {
      return NextResponse.json({ error: "Account is inactive" }, { status: 403 });
    }

    const token = await generateToken({ userId: user.id, email: user.email, role: user.role });
    await setAuthCookie(token);

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "LOGIN",
        resource: "AUTH",
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      },
    });

    return NextResponse.json({
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
      token,
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
