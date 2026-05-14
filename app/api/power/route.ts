import { NextResponse } from 'next/server';

export async function GET() {
  const ENERGO_PRO_API = 'https://my.energo-pro.ge/owback/alerts';

  try {
    const response = await fetch(ENERGO_PRO_API, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      },
      // Disable caching for the proxy to ensure fresh data from Energo-Pro
      next: { revalidate: 0 }
    });

    if (!response.ok) {
      throw new Error(`Energo-Pro API responded with status ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Proxy Error:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch from Energo-Pro', details: error.message },
      { status: 502 }
    );
  }
}
