import { NextResponse } from "next/server"
import type { AuthUser } from "@/types"

const mockUsers: (AuthUser & { password: string })[] = [
  {
    id: 1,
    email: "demo@stockdash.id",
    name: "Demo User",
    password: "password123",
    created_at: "2026-01-01T00:00:00Z",
  },
]

function generateTokens(userId: number) {
  const accessToken = `access_${userId}_${Date.now()}`
  const refreshToken = `refresh_${userId}_${Date.now()}`
  return { access_token: accessToken, refresh_token: refreshToken }
}

export async function POST(request: Request) {
  const body = await request.json()
  const { email, password } = body

  const user = mockUsers.find((u) => u.email === email && u.password === password)
  if (!user) {
    return NextResponse.json({ success: false, message: "Invalid email or password" }, { status: 401 })
  }

  const tokens = generateTokens(user.id)
  return NextResponse.json({
    ...tokens,
    user: { id: user.id, email: user.email, name: user.name, created_at: user.created_at },
  })
}
