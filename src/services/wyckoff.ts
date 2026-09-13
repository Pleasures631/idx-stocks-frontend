export type WyckoffPhase = "accumulation" | "markup" | "distribution" | "markdown"

export interface WyckoffPlanet {
  ticker: string
  name: string
  price: number
  phase: WyckoffPhase
  score: number
  confidence: number
  strength: number
  reason: string
  signal: string
  orbit_position: { x: number; y: number }
}

export interface WyckoffPhaseGroup {
  key: WyckoffPhase
  label: string
  subtitle: string
  description: string
  planets: WyckoffPlanet[]
}

export interface WyckoffOrbitData {
  as_of: string
  source: "mock" | "api"
  phases: WyckoffPhaseGroup[]
}

// Adapter boundary: replace this fallback with the eventual Wyckoff endpoint
// without changing the orbit component or its selection/detail behavior.
const mockWyckoffOrbitData: WyckoffOrbitData = {
  as_of: "2026-09-11",
  source: "mock",
  phases: [
    {
      key: "accumulation",
      label: "Accumulation",
      subtitle: "Supply diserap",
      description: "Harga membentuk base sementara tekanan jual mulai melemah.",
      planets: [
        { ticker: "BBCA", name: "Bank Central Asia", price: 8750, phase: "accumulation", score: 86, confidence: 82, strength: 88, reason: "Range menyempit, volume jual turun, dan net flow mulai positif.", signal: "Base sehat", orbit_position: { x: 25, y: 31 } },
        { ticker: "INCO", name: "Vale Indonesia", price: 4020, phase: "accumulation", score: 73, confidence: 68, strength: 70, reason: "Reclaim support dengan higher low dan volatilitas yang menurun.", signal: "Spring watch", orbit_position: { x: 16, y: 43 } },
        { ticker: "SMGR", name: "Semen Indonesia", price: 2890, phase: "accumulation", score: 64, confidence: 61, strength: 58, reason: "Demand mulai terlihat, tetapi breakout belum terkonfirmasi.", signal: "Early base", orbit_position: { x: 31, y: 18 } },
      ],
    },
    {
      key: "markup",
      label: "Markup",
      subtitle: "Demand memimpin",
      description: "Harga keluar dari base dan demand mendorong tren naik.",
      planets: [
        { ticker: "BMRI", name: "Bank Mandiri", price: 5275, phase: "markup", score: 91, confidence: 88, strength: 94, reason: "Breakout bertahan di atas resistance dengan volume menguat.", signal: "SOS confirmed", orbit_position: { x: 75, y: 28 } },
        { ticker: "ASII", name: "Astra International", price: 5125, phase: "markup", score: 78, confidence: 74, strength: 76, reason: "SMA20 menanjak dan pullback masih diserap buyer.", signal: "Trend active", orbit_position: { x: 86, y: 40 } },
      ],
    },
    {
      key: "distribution",
      label: "Distribution",
      subtitle: "Supply kembali",
      description: "Harga tertahan di area tinggi dan supply mulai mengimbangi demand.",
      planets: [
        { ticker: "BBNI", name: "Bank Negara Indonesia", price: 4970, phase: "distribution", score: 69, confidence: 72, strength: 62, reason: "Repeated rejection dekat high dengan net sell yang meningkat.", signal: "Supply alert", orbit_position: { x: 78, y: 67 } },
        { ticker: "MDKA", name: "Merdeka Copper Gold", price: 2860, phase: "distribution", score: 58, confidence: 59, strength: 50, reason: "Momentum melambat dan range mulai melebar di puncak.", signal: "Topping watch", orbit_position: { x: 87, y: 80 } },
      ],
    },
    {
      key: "markdown",
      label: "Markdown",
      subtitle: "Supply dominan",
      description: "Harga berada di bawah struktur dan tekanan jual masih dominan.",
      planets: [
        { ticker: "GOTO", name: "GoTo Gojek Tokopedia", price: 63, phase: "markdown", score: 44, confidence: 79, strength: 46, reason: "Lower high berulang dan reclaim support belum berhasil.", signal: "Avoid chase", orbit_position: { x: 22, y: 71 } },
        { ticker: "ANTM", name: "Aneka Tambang", price: 3110, phase: "markdown", score: 39, confidence: 66, strength: 40, reason: "Breakdown structure dengan volume distribusi lebih besar.", signal: "Weak trend", orbit_position: { x: 12, y: 83 } },
      ],
    },
  ],
}

export const wyckoffService = {
  async getOrbit(): Promise<WyckoffOrbitData> {
    return Promise.resolve(mockWyckoffOrbitData)
  },
}
