import { NextResponse } from "next/server"
import type { AuthUser } from "@/types"

const mockUsers: (AuthUser & { password: string })[] = []

function generateTokens(userId: number) {
  const accessToken = `access_${userId}_${Date.now()}`
  const refreshToken = `refresh_${userId}_${Date.now()}`
  return { access_token: accessToken, refresh_token: refreshToken }
}

export async function POST(request: Request) {
  const body = await request.json()
  const { name, email, password } = body

  if (!name || !email || !password) {
    return NextResponse.json({ success: false, message: "All fields are required" }, { status: 400 })
  }

  if (mockUsers.find((u) => u.email === email)) {
    return NextResponse.json({ success: false, message: "Email already registered" }, { status: 409 })
  }

  const newUser: AuthUser & { password: string } = {
    id: mockUsers.length + 1,
    email,
    name,
    password,
    created_at: new Date().toISOString(),
  }
  mockUsers.push(newUser)

  const tokens = generateTokens(newUser.id)
  return NextResponse.json({
    ...tokens,
    user: { id: newUser.id, email: newUser.email, name: newUser.name, created_at: newUser.created_at },
  })
}
