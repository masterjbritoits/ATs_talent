import { NextRequest, NextResponse } from "next/server";

import { SettingsRepository } from "@/server/repositories/settings-repository";

const repository = new SettingsRepository();

export async function GET() {
  return NextResponse.json(await repository.list());
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = await repository.upsert(body.key, body.valueJson);
  return NextResponse.json(result);
}
