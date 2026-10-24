type FrontendBindings = {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
};

const HTTPS_HOSTS = new Set(['chupgibaygio.com', 'www.chupgibaygio.com']);

export default {
  async fetch(request: Request, env: FrontendBindings): Promise<Response> {
    const url = new URL(request.url);
    const enforceHttps = HTTPS_HOSTS.has(url.hostname.toLowerCase());

    if (enforceHttps && url.protocol !== 'https:') {
      url.protocol = 'https:';
      return Response.redirect(url.toString(), 308);
    }

    const response = await env.ASSETS.fetch(request);
    if (!enforceHttps || url.protocol !== 'https:') return response;

    const headers = new Headers(response.headers);
    headers.set('Strict-Transport-Security', 'max-age=31536000');
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};
