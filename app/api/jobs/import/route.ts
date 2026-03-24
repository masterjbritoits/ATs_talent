import { NextRequest, NextResponse } from "next/server";

import { importVacancies } from "@/server/services/vacancy-import/service";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = await importVacancies(body.records ?? [], body.source ?? "api");
  return NextResponse.json(result);
}
