import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission
    if (!["ADMIN", "HR"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const employees = await prisma.employee.findMany({
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
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(employees);
  } catch (error) {
    console.error("[v0] Get employees error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || !["ADMIN", "HR"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      userId,
      employeeId,
      department,
      position,
      dateOfJoining,
      salary,
      currentAddress,
      permanentAddr,
      emergencyContact,
    } = await request.json();

    const employee = await prisma.employee.create({
      data: {
        userId,
        employeeId,
        department,
        position,
        dateOfJoining: new Date(dateOfJoining),
        salary,
        currentAddress,
        permanentAddr,
        emergencyContact,
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        action: "CREATE_EMPLOYEE",
        resource: `Employee:${employee.id}`,
      },
    });

    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    console.error("[v0] Create employee error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
