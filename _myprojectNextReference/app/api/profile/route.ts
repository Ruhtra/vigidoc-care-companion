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
    const profile = await prisma.patientProfile.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!profile) {
      // Retorna vazio ou cria um perfil default
      return NextResponse.json({
        userId: session.user.id,
        phone: null,
      });
    }

    return NextResponse.json({
        userId: profile.userId,
        birthDate: profile.birthDate,
        phone: profile.phone,
        emergencyContact: profile.emergencyContact,
        medicalNotes: profile.medicalNotes
    });
  } catch (error) {
    console.error("Erro ao buscar profile:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const body = await req.json();

    const profile = await prisma.patientProfile.upsert({
      where: {
        userId: session.user.id,
      },
      update: {
        phone: body.phone,
        birthDate: body.birthDate ? new Date(body.birthDate) : undefined,
        medicalNotes: body.medicalNotes,
      },
      create: {
        userId: session.user.id,
        phone: body.phone,
        birthDate: body.birthDate ? new Date(body.birthDate) : undefined,
        medicalNotes: body.medicalNotes,
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Erro ao atualizar profile:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
