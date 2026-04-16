import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const auth = await getCurrentUser();
  if (!auth || auth.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find all worker IDs
  const allWorkers = await prisma.worker.findMany({ select: { id: true, userId: true } });

  // Find which userIds actually exist
  const userIds = allWorkers.map((w) => w.userId);
  const existingUsers = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true },
  });
  const existingUserIds = new Set(existingUsers.map((u) => u.id));

  // Orphaned workers = workers whose userId has no matching user
  const orphanedIds = allWorkers
    .filter((w) => !existingUserIds.has(w.userId))
    .map((w) => w.id);

  if (orphanedIds.length === 0) {
    return NextResponse.json({ message: "No orphaned records found", deleted: 0 });
  }

  // Delete orphaned workers (cascade deletes their locationLogs)
  const { count } = await prisma.worker.deleteMany({
    where: { id: { in: orphanedIds } },
  });

  return NextResponse.json({ message: `Cleaned up ${count} orphaned worker record(s)`, deleted: count });
}
