import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return handleProxy(req, path);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return handleProxy(req, path);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return handleProxy(req, path);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return handleProxy(req, path);
}

async function handleProxy(req: NextRequest, pathSegments: string[]) {
  const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3005';
  const path = pathSegments.join('/');
  const targetUrl = `${BACKEND_URL}/api/billing/${path}${req.nextUrl.search}`;

  // Forward only safe headers - skip host which would confuse Express
  const forwardHeaders: Record<string, string> = {};
  const skipHeaders = new Set(['host', 'connection', 'transfer-encoding']);
  req.headers.forEach((val, key) => {
    if (!skipHeaders.has(key.toLowerCase())) {
      forwardHeaders[key] = val;
    }
  });

  // Always ensure JSON content type for mutating requests
  if (['POST', 'PATCH', 'PUT'].includes(req.method)) {
    forwardHeaders['content-type'] = 'application/json';
  }

  const init: RequestInit = {
    method: req.method,
    headers: forwardHeaders,
  };

  if (['POST', 'PATCH', 'PUT'].includes(req.method)) {
    try {
      init.body = await req.text();
    } catch (e) {
      // No body
    }
  }

  try {
    const response = await fetch(targetUrl, init);
    const data = await response.text();

    const resHeaders = new Headers();
    response.headers.forEach((val, key) => {
      if (key.toLowerCase() !== 'transfer-encoding') resHeaders.set(key, val);
    });

    return new NextResponse(data, { status: response.status, headers: resHeaders });
  } catch (error: any) {
    console.error(`[Billing Proxy] Failed to reach backend at ${targetUrl}:`, error.message);
    return NextResponse.json({ error: 'Failed to communicate with lead engine backend' }, { status: 502 });
  }
}
