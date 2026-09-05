import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const body = await request.json()
  const { refresh_token } = body

  if (!refresh_token) {
    return NextResponse.json({ success: false, message: "Refresh token required" }, { status: 400 })
  }

  const accessToken = `access_new_${Date.now()}`
  const refreshToken = `refresh_new_${Date.now()}`

  return NextResponse.json({
    access_token: accessToken,
    refresh_token: refreshToken,
  })
}
