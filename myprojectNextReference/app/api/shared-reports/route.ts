import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  try {
    const reports = await prisma.sharedReport.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });
    const mapped = reports.map(r => ({
      id: r.id,
      share_code: r.shareCode,
      title: r.title,
      include_blood_pressure: r.includeBloodPressure,
      include_heart_rate: r.includeHeartRate,
      include_temperature: r.includeTemperature,
      include_oxygen: r.includeOxygen,
      include_weight: r.includeWeight,
      include_pain: r.includePain,
      include_profile: r.includeProfile,
      date_from: r.dateFrom,
      date_to: r.dateTo,
      expires_at: r.expiresAt,
      views_count: r.viewsCount,
      is_active: r.isActive,
      created_at: r.createdAt
    }));
    return NextResponse.json(mapped);
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  try {
    const body = await req.json();
    const report = await prisma.sharedReport.create({
      data: {
        userId: session.user.id,
        shareCode: body.share_code,
        title: body.title,
        includeBloodPressure: body.include_blood_pressure,
        includeHeartRate: body.include_heart_rate,
        includeTemperature: body.include_temperature,
        includeOxygen: body.include_oxygen,
        includeWeight: body.include_weight,
        includePain: body.include_pain,
        includeProfile: body.include_profile,
        dateFrom: body.date_from ? new Date(body.date_from) : null,
        dateTo: body.date_to ? new Date(body.date_to) : null,
        expiresAt: body.expires_at ? new Date(body.expires_at) : null,
      },
    });
    return NextResponse.json({ success: true, report }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
