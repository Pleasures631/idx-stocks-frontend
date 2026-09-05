import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    user: {
      id: 1,
      email: "demo@stockdash.id",
      name: "Demo User",
      created_at: "2026-01-01T00:00:00Z",
    },
  })
}
