const ALLOWED_TARGET_ORIGINS = new Set([
  'https://ai.silkroadai.io',
  'https://images.silkroadai.io',
  'https://hk.getelucid.com'
]);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'authorization,content-type',
  'Access-Control-Max-Age': '86400'
};

export async function onRequest(context) {
  const { request } = context;
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const incomingUrl = new URL(request.url);
  const target = incomingUrl.searchParams.get('url');
  if (!target) return json({ error: 'Missing url query parameter' }, 400);

  let targetUrl;
  try {
    targetUrl = new URL(target);
  } catch (error) {
    return json({ error: 'Invalid target url' }, 400);
  }

  if (!ALLOWED_TARGET_ORIGINS.has(targetUrl.origin)) {
    return json({ error: `Target origin is not allowed: ${targetUrl.origin}` }, 403);
  }

  const headers = new Headers();
  const authorization = request.headers.get('authorization');
  const contentType = request.headers.get('content-type');
  if (authorization) headers.set('authorization', authorization);
  if (contentType) headers.set('content-type', contentType);

  const init = {
    method: request.method,
    headers
  };
  if (!['GET', 'HEAD'].includes(request.method)) {
    init.body = await request.arrayBuffer();
  }

  const upstream = await fetch(targetUrl.toString(), init);
  const responseHeaders = new Headers(upstream.headers);
  for (const [key, value] of Object.entries(corsHeaders)) {
    responseHeaders.set(key, value);
  }
  responseHeaders.delete('content-encoding');
  responseHeaders.delete('content-length');

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders
  });
}

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'content-type': 'application/json; charset=utf-8'
    }
  });
}
