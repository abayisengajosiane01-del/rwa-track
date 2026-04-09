import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, generateToken, setAuthCookie } from "@/lib/auth";

export async function POST() {
  return NextResponse.json(
    { error: "Self-registration is disabled. Workers are registered by HR only." },
    { status: 403 }
  );
}
