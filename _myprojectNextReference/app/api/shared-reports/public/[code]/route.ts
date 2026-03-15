import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const resolvedParams = await params;
    const report = await prisma.sharedReport.findUnique({
      where: { shareCode: resolvedParams.code },
      include: {
        user: {
          include: {
            patientProfile: true,
            vitalRecords: {
              orderBy: { recordedAt: "desc" }
            }
          }
        }
      }
    });

    if (!report || !report.isActive) {
      return NextResponse.json({ error: "Relatório indisponível" }, { status: 404 });
    }

    if (report.expiresAt && report.expiresAt < new Date()) {
      return NextResponse.json({ error: "Relatório expirado" }, { status: 404 });
    }

    // Filter vitals based on dates
    let vitals = report.user.vitalRecords;
    if (report.dateFrom) {
       vitals = vitals.filter(v => v.recordedAt >= report.dateFrom!);
    }
    if (report.dateTo) {
       vitals = vitals.filter(v => v.recordedAt <= new Date(`${report.dateTo!.toISOString().split('T')[0]}T23:59:59`));
    }

    // Filter vitals fields based on permissions
    const mappedVitals = vitals.map(v => ({
       id: v.id,
       recorded_at: v.recordedAt,
       systolic: report.includeBloodPressure ? v.systolic : undefined,
       diastolic: report.includeBloodPressure ? v.diastolic : undefined,
       heart_rate: report.includeHeartRate ? v.heartRate : undefined,
       temperature: report.includeTemperature ? v.temperature : undefined,
       oxygen_saturation: report.includeOxygen ? v.oxygenSaturation : undefined,
       weight: report.includeWeight ? v.weight : undefined,
       pain_level: report.includePain ? v.painLevel : undefined,
    }));

    // Update views count
    await prisma.sharedReport.update({
      where: { id: report.id },
      data: { viewsCount: report.viewsCount + 1 }
    });

    const profile = report.includeProfile ? {
       full_name: report.user.name,
       birth_date: report.user.patientProfile?.birthDate,
       phone: report.user.patientProfile?.phone,
       emergency_contact: report.user.patientProfile?.emergencyContact,
       medical_notes: report.user.patientProfile?.medicalNotes,
    } : null;

    // Map the report itself to snake case for the frontend
    const mappedReport = {
       id: report.id,
       title: report.title,
       include_blood_pressure: report.includeBloodPressure,
       include_heart_rate: report.includeHeartRate,
       include_temperature: report.includeTemperature,
       include_oxygen: report.includeOxygen,
       include_weight: report.includeWeight,
       include_pain: report.includePain,
       include_profile: report.includeProfile,
       date_from: report.dateFrom,
       date_to: report.dateTo,
       created_at: report.createdAt
    };

    return NextResponse.json({
       report: mappedReport,
       vitals: mappedVitals,
       profile
    });

  } catch (error) {
    console.error("Erro no relatorio publico:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
