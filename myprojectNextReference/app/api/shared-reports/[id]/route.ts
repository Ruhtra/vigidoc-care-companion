import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  try {
    const resolvedParams = await params;
    const body = await req.json();
    await prisma.sharedReport.updateMany({
      where: { id: resolvedParams.id, userId: session.user.id },
      data: { isActive: body.is_active },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  try {
    const resolvedParams = await params;
    await prisma.sharedReport.deleteMany({
      where: { id: resolvedParams.id, userId: session.user.id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro" }, { status: 500 });
  }
}
