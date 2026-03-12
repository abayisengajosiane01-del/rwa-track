import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const residenceRequest = await prisma.residenceRequest.findUnique({
      where: { id: params.id },
      include: {
        employee: {
          include: {
            user: true,
          },
        },
        submitter: true,
        reviewer: true,
      },
    });

    if (!residenceRequest) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(residenceRequest);
  } catch (error) {
    console.error("[v0] Get residence request error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getCurrentUser();

    if (!user || !["ADMIN", "HR"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status, comments } = await request.json();

    const residenceRequest = await prisma.residenceRequest.update({
      where: { id: params.id },
      data: {
        status,
        comments,
        reviewedBy: user.userId,
        reviewDate: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        action: "UPDATE_RESIDENCE_REQUEST",
        resource: `ResidenceRequest:${residenceRequest.id}`,
        details: JSON.stringify({ status, comments }),
      },
    });

    return NextResponse.json(residenceRequest);
  } catch (error) {
    console.error("[v0] Update residence request error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const residenceRequest = await prisma.residenceRequest.delete({
      where: { id: params.id },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        action: "DELETE_RESIDENCE_REQUEST",
        resource: `ResidenceRequest:${residenceRequest.id}`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[v0] Delete residence request error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
