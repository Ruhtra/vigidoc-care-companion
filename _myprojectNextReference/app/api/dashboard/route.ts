import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const userId = session.user.id;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    // Fetch all data in parallel to save time
    const [profile, vitals, reminders] = await Promise.all([
      prisma.patientProfile.findUnique({
        where: { userId },
      }),
      prisma.vitalRecord.findMany({
        where: {
          userId,
          recordedAt: {
            gte: today,
          },
        },
        orderBy: {
          recordedAt: "desc",
        },
      }),
      prisma.reminder.findMany({
        where: { userId },
        orderBy: { time: "asc" },
      }),
    ]);

    return NextResponse.json({
      profile,
      vitals,
      reminders,
      user: session.user,
    });
  } catch (error) {
    console.error("Erro ao buscar dados do dashboard:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
