import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await getCurrentUser();
  if (!auth || !["ADMIN", "HR"].includes(auth.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const where = auth.role === "HR" ? { hrId: auth.userId } : {};

  const workers = await prisma.worker.findMany({
    where,
    include: {
      user: {
        select: { id: true, email: true, firstName: true, lastName: true, phone: true, status: true },
      },
      hr: { select: { firstName: true, lastName: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Separate valid from orphaned
  const valid = workers.filter((w) => w.user !== null);
  const orphanIds = workers.filter((w) => w.user === null).map((w) => w.id);

  // Auto-delete orphans silently so they never cause issues again
  if (orphanIds.length > 0) {
    await prisma.worker.deleteMany({ where: { id: { in: orphanIds } } }).catch(() => null);
  }

  return NextResponse.json(valid);
}

export async function POST(request: NextRequest) {
  const auth = await getCurrentUser();
  if (!auth || auth.role !== "HR") {
    return NextResponse.json({ error: "Only HR can register workers" }, { status: 403 });
  }

  const { firstName, lastName, email, phone, password, jobTitle, homeAddress, workAddress } =
    await request.json();

  if (!firstName || !lastName || !email || !password || !jobTitle) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: "Email already in use" }, { status: 409 });

  const hashedPassword = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, password: hashedPassword, firstName, lastName, phone, role: "WORKER" },
  });

  const worker = await prisma.worker.create({
    data: { userId: user.id, hrId: auth.userId, jobTitle, homeAddress, workAddress },
  });

  await prisma.auditLog.create({
    data: { userId: auth.userId, action: "CREATE_WORKER", resource: `Worker:${worker.id}` },
  });

  // Return with full user object (excluding password)
  return NextResponse.json(
    {
      ...worker,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        status: user.status,
      },
    },
    { status: 201 }
  );
}
