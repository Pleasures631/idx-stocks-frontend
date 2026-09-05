import { StockDetailPage } from "@/components/stocks/stock-detail-page"

export default function StockDetail({ params }: { params: { ticker: string } }) {
  return <StockDetailPage ticker={params.ticker} />
}
