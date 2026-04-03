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
      user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true, status: true } },
      hr: { select: { firstName: true, lastName: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(workers);
}

export async function POST(request: NextRequest) {
  const auth = await getCurrentUser();
  if (!auth || !["ADMIN", "HR"].includes(auth.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { firstName, lastName, email, phone, password, jobTitle, hrId, homeAddress, workAddress } =
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
    data: {
      userId: user.id,
      hrId: hrId || (auth.role === "HR" ? auth.userId : null),
      jobTitle,
      homeAddress,
      workAddress,
    },
  });

  await prisma.auditLog.create({
    data: { userId: auth.userId, action: "CREATE_WORKER", resource: `Worker:${worker.id}` },
  });

  return NextResponse.json({ ...worker, user }, { status: 201 });
}
