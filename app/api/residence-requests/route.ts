import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const role = user.role;

    let where: any = {};

    if (role === "EMPLOYEE") {
      // Employees see only their requests
      const employee = await prisma.employee.findUnique({
        where: { userId: user.userId },
      });
      if (employee) {
        where.employeeId = employee.id;
      }
    } else if (role === "HR") {
      // HR sees all requests
      if (status) {
        where.status = status;
      }
    } else if (role === "ADMIN") {
      // Admin sees all
      if (status) {
        where.status = status;
      }
    }

    const requests = await prisma.residenceRequest.findMany({
      where,
      include: {
        employee: {
          include: {
            user: {
              select: {
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        submitter: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        reviewer: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("[v0] Get residence requests error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { employeeId, newAddress, moveDate, reason, documentation } =
      await request.json();

    const residenceRequest = await prisma.residenceRequest.create({
      data: {
        employeeId,
        submittedBy: user.userId,
        newAddress,
        moveDate: new Date(moveDate),
        reason,
        documentation,
        status: "PENDING",
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        action: "CREATE_RESIDENCE_REQUEST",
        resource: `ResidenceRequest:${residenceRequest.id}`,
      },
    });

    return NextResponse.json(residenceRequest, { status: 201 });
  } catch (error) {
    console.error("[v0] Create residence request error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
