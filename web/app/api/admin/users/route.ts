import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await getCurrentUser();
  if (!auth || auth.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    select: { id: true, email: true, firstName: true, lastName: true, phone: true, role: true, status: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
}

export async function PUT(request: NextRequest) {
  const auth = await getCurrentUser();
  if (!auth || auth.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId, role, status } = await request.json();

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { role, status },
    select: { id: true, email: true, firstName: true, lastName: true, role: true, status: true },
  });

  await prisma.auditLog.create({
    data: {
      userId: auth.userId,
      action: "UPDATE_USER",
      resource: `User:${userId}`,
      details: JSON.stringify({ role, status }),
    },
  });

  return NextResponse.json(updated);
}
