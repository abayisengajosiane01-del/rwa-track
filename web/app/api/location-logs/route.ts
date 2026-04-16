import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const auth = await getCurrentUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { lat, lng, accuracy } = await request.json();
  if (!lat || !lng) return NextResponse.json({ error: "lat and lng required" }, { status: 400 });

  const worker = await prisma.worker.findUnique({ where: { userId: auth.userId } });
  if (!worker) return NextResponse.json({ error: "Worker profile not found" }, { status: 404 });

  const log = await prisma.locationLog.create({
    data: { workerId: worker.id, lat, lng, accuracy },
  });

  return NextResponse.json(log, { status: 201 });
}

export async function GET() {
  const auth = await getCurrentUser();
  if (!auth || !["ADMIN", "HR"].includes(auth.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const where = auth.role === "HR" ? { worker: { hrId: auth.userId } } : {};

  const logs = await prisma.locationLog.findMany({
    where,
    include: {
      worker: {
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
        },
      },
    },
    orderBy: { recordedAt: "desc" },
    take: 200,
  });

  // Filter out logs whose worker or user is orphaned
  const valid = logs.filter((l) => l.worker !== null && l.worker.user !== null);

  return NextResponse.json(valid);
}
