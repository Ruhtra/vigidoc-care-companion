import { auth } from "@/lib/auth";
import { getUserPermision } from "@/lib/casl/utils/getUserPermission";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { cannot } = getUserPermision(session.user.id, session.user.role);

  if (
    cannot("get", {
      kind: "User",
      id: session.user.id,
    })
  ) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  return NextResponse.json(session.user);
}
