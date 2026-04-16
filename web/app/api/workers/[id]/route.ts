import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getCurrentUser();
  if (!auth || !["ADMIN", "HR"].includes(auth.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const worker = await prisma.worker.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true, status: true } },
      hr: { select: { firstName: true, lastName: true, email: true } },
      locationLogs: { orderBy: { recordedAt: "desc" }, take: 50 },
    },
  });

  if (!worker || !worker.user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(worker);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getCurrentUser();
  if (!auth || !["ADMIN", "HR"].includes(auth.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const data = await request.json();

  const worker = await prisma.worker.update({
    where: { id },
    data: {
      jobTitle: data.jobTitle,
      hrId: data.hrId,
      homeAddress: data.homeAddress,
      homeLat: data.homeLat,
      homeLng: data.homeLng,
      workAddress: data.workAddress,
      workLat: data.workLat,
      workLng: data.workLng,
    },
  });

  return NextResponse.json(worker);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getCurrentUser();
  if (!auth || !["ADMIN", "HR"].includes(auth.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.worker.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
