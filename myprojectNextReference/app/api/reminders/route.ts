import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const reminders = await prisma.reminder.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        time: "asc",
      },
    });

    return NextResponse.json(reminders);
  } catch (error) {
    console.error("Erro ao buscar reminders:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const body = await req.json();

    const reminder = await prisma.reminder.create({
      data: {
        userId: session.user.id,
        time: body.time,
        label: body.label,
        days: body.days || [],
        reminderType: body.reminder_type || "vital_collection",
        enabled: body.enabled ?? true,
      },
    });

    return NextResponse.json(reminder, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar reminder:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
