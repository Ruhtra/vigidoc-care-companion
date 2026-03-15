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
    const userRole = session.user.role;
    if (userRole !== "admin") {
      return NextResponse.json({ error: "Você não tem permissão para acessar esta página" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const filterUserId = searchParams.get("userId");

    const whereProfile: any = {};
    if (filterUserId) {
      whereProfile.userId = filterUserId;
    }

    const whereVitals: any = {};
    if (dateFrom) {
      whereVitals.recordedAt = { gte: new Date(dateFrom) };
    }
    if (dateTo) {
      whereVitals.recordedAt = { ...whereVitals.recordedAt, lte: new Date(`${dateTo}T23:59:59`) };
    }

    const profiles = await prisma.patientProfile.findMany({
      where: whereProfile,
      include: {
        user: {
          include: {
            vitalRecords: {
              where: whereVitals,
              orderBy: { recordedAt: "desc" },
            },
          },
        },
      },
    });

    const mapped = profiles.map((p) => ({
      id: p.id,
      user_id: p.userId,
      full_name: p.user.name,
      phone: p.phone,
      birth_date: p.birthDate,
      emergency_contact: p.emergencyContact,
      medical_notes: p.medicalNotes,
      vitals: p.user.vitalRecords.map((v) => ({
        id: v.id,
        recorded_at: v.recordedAt,
        systolic: v.systolic,
        diastolic: v.diastolic,
        heart_rate: v.heartRate,
        temperature: v.temperature,
        oxygen_saturation: v.oxygenSaturation,
        weight: v.weight,
        pain_level: v.painLevel,
      })),
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("Erro ao buscar admin patients:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
