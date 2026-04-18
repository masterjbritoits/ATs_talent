import { NextRequest, NextResponse } from \"next/server\";

import { prisma } from \"@/lib/db/prisma\";

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id: candidateId } = params;

  try {
    const auditLogs = await prisma.auditLog.findMany({
      where: { 
        entityType: \"CANDIDATE\",
        entityId: candidateId 
      },
      orderBy: { createdAt: \"desc\" },
      take: 50 // Last 50 actions
    });

    return NextResponse.json(auditLogs);
  } catch (error) {
    console.error(\"[candidates/audit] Error:\", error);
    return NextResponse.json(
      { error: \"Failed to fetch audit logs\" },
      { status: 500 }
    );
  }
}
