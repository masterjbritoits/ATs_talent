import { NextRequest, NextResponse } from "next/server";

import { scheduleInterview } from "@/server/services/calendar/service";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const event = await scheduleInterview(body);
  return NextResponse.json(event, { status: 201 });
}
