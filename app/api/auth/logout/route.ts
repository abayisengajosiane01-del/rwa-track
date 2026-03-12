import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookie, getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    // Log audit if user exists
    if (user) {
      await prisma.auditLog.create({
        data: {
          userId: user.userId,
          action: "LOGOUT",
          resource: "AUTH",
          ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        },
      });
    }

    // Clear cookie
    await clearAuthCookie();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[v0] Logout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
