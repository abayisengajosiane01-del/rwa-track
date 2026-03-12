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

    const employee = await prisma.employee.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            status: true,
          },
        },
      },
    });

    if (!employee) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(employee);
  } catch (error) {
    console.error("[v0] Get employee error:", error);
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

    const data = await request.json();

    const employee = await prisma.employee.update({
      where: { id: params.id },
      data,
    });

    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        action: "UPDATE_EMPLOYEE",
        resource: `Employee:${employee.id}`,
      },
    });

    return NextResponse.json(employee);
  } catch (error) {
    console.error("[v0] Update employee error:", error);
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

    const employee = await prisma.employee.delete({
      where: { id: params.id },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        action: "DELETE_EMPLOYEE",
        resource: `Employee:${employee.id}`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[v0] Delete employee error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
