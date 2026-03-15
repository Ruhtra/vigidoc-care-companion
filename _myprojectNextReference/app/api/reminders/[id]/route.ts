import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const resolvedParams = await params;
    const body = await req.json();

    const reminder = await prisma.reminder.updateMany({
      where: {
        id: resolvedParams.id,
        userId: session.user.id, // assegura segurança
      },
      data: {
        enabled: body.enabled,
      },
    });

    if (reminder.count === 0) {
      return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao atualizar reminder:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const resolvedParams = await params;
    
    // Verifica primeiro se pertence ao usuário ou deleta direto via where duplo
    const reminder = await prisma.reminder.deleteMany({
      where: {
        id: resolvedParams.id,
        userId: session.user.id,
      },
    });

    if (reminder.count === 0) {
      return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar reminder:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
