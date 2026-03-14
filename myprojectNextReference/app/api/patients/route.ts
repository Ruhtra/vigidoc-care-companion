import { auth } from "@/lib/auth";
import { getUserPermision } from "@/lib/casl/utils/getUserPermission";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { 
  resolveHeartRate, 
  resolveO2Saturation, 
  resolveTemperature, 
  resolveSystolicPressure, 
  resolvePain,
  resolveGeneric 
} from "@/lib/utils/vitals";
import type { Patient, RecordSession } from "@/types/patient";

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { cannot } = getUserPermision(session.user.id, session.user.role);

  // Exemplo de verificação CASL para listagem
  if (
    cannot("get", {
      kind: "User",
      id: "ANY",
    }) &&
    session.user.role !== "admin"
  ) {
    // Basic protection (allowing only admin to view patients list or patients detail here unless specified by casl)
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  try {
    let whereClause: any = {
      patientProfile: {
        isNot: null,
      },
    };

    // Filtro por Médico
    // if (session.user.role !== "admin") {
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!doctorProfile) {
      // Se for um usuário comum sem perfil de médico, não vê ninguém na lista de gestão
      return NextResponse.json([]);
    }

    whereClause = {
      patientProfile: {
        doctorId: doctorProfile.id,
      },
    };
    // }

    // Buscar todos os usuários que têm patientProfile, junto com seu último vitalRecord
    const users = await prisma.user.findMany({
      where: whereClause,
      include: {
        patientProfile: true,
        vitalRecords: {
          orderBy: { recordedAt: "desc" },
          take: 1, // Pegamos apenas o mais recente para a lista
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    const mapRecordToSession = (record: any): RecordSession => {
      return {
        date: record.recordedAt.toISOString(),
        heartRate: {
          label: "FC",
          value: record.heartRate ?? "-",
          unit: "bpm",
          status: resolveHeartRate(record.heartRate),
        },
        bloodPressure: {
          label: "PA",
          value:
            record.systolic && record.diastolic
              ? `${record.systolic}/${record.diastolic}`
              : "-",
          unit: "mmHg",
          status: resolveSystolicPressure(record.systolic),
        },
        oxygenSaturation: {
          label: "SpO2",
          value: record.oxygenSaturation ?? "-",
          unit: "%",
          status: resolveO2Saturation(record.oxygenSaturation),
        },
        temperature: {
          label: "Temp",
          value: record.temperature ?? "-",
          unit: "°C",
          status: resolveTemperature(record.temperature),
        },
        weight: {
          label: "Peso",
          value: record.weight ?? "-",
          unit: "kg",
          status: resolveGeneric(record.weight),
        },
        pain: {
          label: "Dor",
          value: record.painLevel ?? "-",
          unit: "/10",
          status: resolvePain(record.painLevel),
        },
      };
    };

    const defaultSession: RecordSession = {
      date: new Date().toISOString(),
      heartRate: { label: "FC", value: "-", unit: "bpm", status: "normal" },
      bloodPressure: {
        label: "PA",
        value: "-",
        unit: "mmHg",
        status: "normal",
      },
      oxygenSaturation: {
        label: "SpO2",
        value: "-",
        unit: "%",
        status: "normal",
      },
      temperature: { label: "Temp", value: "-", unit: "°C", status: "normal" },
      weight: { label: "Peso", value: "-", unit: "kg", status: "normal" },
      pain: { label: "Dor", value: "-", unit: "/10", status: "normal" },
    };

    const patientsList: Patient[] = users.map((user) => {
      const profile = user.patientProfile!;
      const vitalRecords = user.vitalRecords;

      // Calcular idade
      let age = 0;
      if (profile.birthDate) {
        const ageDifMs = Date.now() - profile.birthDate.getTime();
        const ageDate = new Date(ageDifMs);
        age = Math.abs(ageDate.getUTCFullYear() - 1970);
      }

      const lastRecord =
        vitalRecords.length > 0
          ? mapRecordToSession(vitalRecords[0])
          : defaultSession;

      return {
        id: user.id,
        name: user.name,
        age,
        phone: profile.phone ?? "Não informado",
        avatarUrl: user.image ?? null,
        dateOfBirth: profile.birthDate
          ? profile.birthDate.toISOString()
          : new Date().toISOString(),
        admissionDate: profile.createdAt.toISOString(),
        diseaseType: profile.diseaseType ?? "Não informado",
        cid: profile.cid ?? "Não informado",
        ecog: (profile.ecog ?? 0) as any,
        diagnosis: profile.diagnosis ?? "Não informado",
        lastRecord,
        dailyHistory: [], // Na lista não precisamos do histórico completo, apenas do lastRecord
      };
    });

    return NextResponse.json(patientsList);
  } catch (error) {
    console.error("Erro ao buscar pacientes:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
