import { NextRequest, NextResponse } from "next/server";

const BINANCE_BASE = "https://api.binance.us";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const binancePath = path.join("/");
  const searchParams = request.nextUrl.searchParams.toString();
  const url = `${BINANCE_BASE}/${binancePath}${searchParams ? `?${searchParams}` : ""}`;

  try {
    const response = await fetch(url, {
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { error: "Failed to proxy request to Binance" },
      { status: 502 }
    );
  }
}
