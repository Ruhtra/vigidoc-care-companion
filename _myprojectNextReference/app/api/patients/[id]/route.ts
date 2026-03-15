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

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { cannot } = getUserPermision(session.user.id, session.user.role);

  let isAdmin = session.user.role === "admin";
  let doctorId: string | null = null;

  // if (!isAdmin) {
  const doctorProfile = await prisma.doctorProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!doctorProfile) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }
  doctorId = doctorProfile.id;
  // }

  const resolvedParams = await params;
  const patientId = resolvedParams.id;

  const user = await prisma.user.findUnique({
    where: { id: patientId },
    include: {
      patientProfile: true,
      vitalRecords: {
        orderBy: { recordedAt: "desc" },
      },
    },
  });

  if (!user || !user.patientProfile) {
    return NextResponse.json(
      { error: "Paciente não encontrado" },
      { status: 404 },
    );
  }

  // Verificar se o médico é o responsável pelo paciente
  if (user.patientProfile.doctorId !== doctorId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const profile = user.patientProfile;
  const vitalRecords = user.vitalRecords;

  // Calculate age
  let age = 0;
  if (profile.birthDate) {
    const ageDifMs = Date.now() - profile.birthDate.getTime();
    const ageDate = new Date(ageDifMs);
    age = Math.abs(ageDate.getUTCFullYear() - 1970);
  }

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

  const sessions = vitalRecords.map(mapRecordToSession);

  // Default session if empty
  const defaultSession: RecordSession = {
    date: new Date().toISOString(),
    heartRate: { label: "FC", value: "-", unit: "bpm", status: "normal" },
    bloodPressure: { label: "PA", value: "-", unit: "mmHg", status: "normal" },
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

  const lastRecord = sessions.length > 0 ? sessions[0] : defaultSession;
  const dailyHistory = sessions.length > 1 ? sessions.slice(1) : [];

  const patientResponse: Patient = {
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
    dailyHistory,
  };

  return NextResponse.json(patientResponse);
}
