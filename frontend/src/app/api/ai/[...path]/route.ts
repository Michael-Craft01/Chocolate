import { NextRequest, NextResponse } from 'next/server';

import { aiService } from '@/lib/ai-service';
import { getAuthUser, authError } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  if (path.length === 1 && path[0] === 'refine') {
    // Prevent unauthenticated resource consumption in production
    const user = await getAuthUser(req);
    if (!user) return authError();

    try {
      const body = await req.json();
      const { field, value, context } = body ?? {};

      // ── Input validation ──────────────────────────────────────────
      if (!field || typeof field !== 'string') {
        return NextResponse.json({ error: 'field is required and must be a string' }, { status: 400 });
      }
      if (field.length > 200) {
        return NextResponse.json({ error: 'field name too long' }, { status: 400 });
      }
      if (value && typeof value !== 'string') {
        return NextResponse.json({ error: 'value must be a string' }, { status: 400 });
      }
      const safeValue = typeof value === 'string' ? value.slice(0, 5000) : '';

      // Sanitise field label — strip special chars that could influence the prompt
      const safeField = field.replace(/[<>{}|`]/g, '').slice(0, 200);

      // Strip any sensitive context keys server-side as a defence-in-depth measure
      let safeContext: Record<string, unknown> = {};
      if (context && typeof context === 'object' && !Array.isArray(context)) {
        const BLOCKED = /webhook|password|secret|token|key|api|bearer|auth|credential/i;
        for (const [k, v] of Object.entries(context as Record<string, unknown>)) {
          if (!BLOCKED.test(k)) safeContext[k] = v;
        }
      }
      // ─────────────────────────────────────────────────────────────

      const refined = await aiService.refineInput(safeField, safeValue, safeContext);
      return NextResponse.json({ refined });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Internal Server Error';
      console.error('[Next AI /refine] Error for user', user?.id, ':', msg);
      return NextResponse.json({ error: msg }, { status: 500 });
    }
  }

  return handleProxy(req, path);
}

async function handleProxy(req: NextRequest, pathSegments: string[]) {
  const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3005';
  const path = pathSegments.join('/');
  const targetUrl = `${BACKEND_URL}/api/ai/${path}${req.nextUrl.search}`;

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
    console.error(`[AI Proxy] Failed to reach backend at ${targetUrl}:`, error.message);
    return NextResponse.json({ error: 'Failed to communicate with lead engine backend' }, { status: 502 });
  }
}
