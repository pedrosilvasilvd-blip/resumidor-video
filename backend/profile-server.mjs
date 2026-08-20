import http from 'node:http';
import { spawn } from 'node:child_process';

const FRONT_PORT = Number(process.env.PORT || 9000);
const COBALT_PORT = Number(process.env.COBALT_INTERNAL_PORT || 9001);
const MAX_PROFILE_ITEMS = 500;
const ALLOWED_HOSTS = ['youtube.com', 'youtu.be', 'tiktok.com', 'instagram.com'];

function corsHeaders(extra = {}) {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Accept,Authorization',
    'Access-Control-Expose-Headers': 'Content-Disposition,Content-Length,Content-Type',
    ...extra,
  };
}

function sendJson(res, status, value) {
  const body = JSON.stringify(value);
  res.writeHead(status, corsHeaders({
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
  }));
  res.end(body);
}

function detectPlatform(rawUrl) {
  const host = new URL(rawUrl).hostname.toLowerCase().replace(/^www\./, '');
  if (host === 'youtu.be' || host === 'youtube.com' || host.endsWith('.youtube.com')) return 'youtube';
  if (host === 'tiktok.com' || host.endsWith('.tiktok.com')) return 'tiktok';
  if (host === 'instagram.com' || host.endsWith('.instagram.com')) return 'instagram';
  return null;
}

function validateProfileUrl(rawUrl) {
  const url = new URL(rawUrl);
  if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new Error('Protocolo inválido.');
  const host = url.hostname.toLowerCase().replace(/^www\./, '');
  const allowed = ALLOWED_HOSTS.some(domain => host === domain || host.endsWith(`.${domain}`));
  if (!allowed) throw new Error('Plataforma não permitida.');
  return url.toString();
}

function pickThumbnail(entry) {
  if (entry?.thumbnail) return entry.thumbnail;
  const thumbs = Array.isArray(entry?.thumbnails) ? entry.thumbnails : [];
  return thumbs.length ? (thumbs[thumbs.length - 1].url || '') : '';
}

function mediaUrlForEntry(entry, platform, profileUrl) {
  const direct = [entry?.webpage_url, entry?.original_url, entry?.url]
    .find(value => typeof value === 'string' && /^https?:\/\//i.test(value));
  if (direct) return direct;

  const id = String(entry?.id || '').trim();
  if (!id) return '';
  if (platform === 'youtube') return `https://www.youtube.com/watch?v=${encodeURIComponent(id)}`;
  if (platform === 'tiktok') {
    const username = new URL(profileUrl).pathname.match(/@([A-Za-z0-9._-]+)/)?.[1] || 'user';
    return `https://www.tiktok.com/@${username}/video/${encodeURIComponent(id)}`;
  }
  if (platform === 'instagram') return `https://www.instagram.com/p/${encodeURIComponent(id)}/`;
  return '';
}

function flattenEntries(value, output = []) {
  if (!value) return output;
  if (Array.isArray(value)) {
    for (const item of value) flattenEntries(item, output);
    return output;
  }
  if (Array.isArray(value.entries)) {
    for (const item of value.entries) flattenEntries(item, output);
  } else if (value.id || value.url || value.webpage_url) {
    output.push(value);
  }
  return output;
}

function runYtDlpProfile(profileUrl, limit) {
  return new Promise((resolve, reject) => {
    const args = [
      '--ignore-errors',
      '--no-warnings',
      '--flat-playlist',
      '--dump-single-json',
      '--socket-timeout', '25',
      '--extractor-retries', '2',
      '--playlist-end', String(limit),
      profileUrl,
    ];
    const child = spawn('yt-dlp', args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    let finished = false;

    const timer = setTimeout(() => {
      if (finished) return;
      child.kill('SIGKILL');
      reject(new Error('A listagem do perfil passou de 2 minutos. Tente um limite menor.'));
    }, 120000);

    child.stdout.on('data', chunk => {
      stdout += chunk.toString();
      if (stdout.length > 30 * 1024 * 1024) {
        child.kill('SIGKILL');
        reject(new Error('A resposta do perfil ficou grande demais. Use um limite menor.'));
      }
    });
    child.stderr.on('data', chunk => { stderr += chunk.toString(); });
    child.on('error', error => {
      clearTimeout(timer);
      reject(error);
    });
    child.on('close', code => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      if (!stdout.trim()) {
        reject(new Error(stderr.trim().split('\n').slice(-2).join(' ') || `yt-dlp terminou com código ${code}`));
        return;
      }
      try {
        const parsed = JSON.parse(stdout);
        resolve(parsed);
      } catch (error) {
        reject(new Error(`Não foi possível interpretar a lista do perfil: ${error.message}`));
      }
    });
  });
}

async function handleProfile(req, res, requestUrl) {
  try {
    const rawUrl = requestUrl.searchParams.get('url') || '';
    const profileUrl = validateProfileUrl(rawUrl);
    const platform = detectPlatform(profileUrl);
    if (!platform) throw new Error('Use um perfil/canal do YouTube, TikTok ou Instagram.');

    const requested = Number.parseInt(requestUrl.searchParams.get('limit') || '100', 10);
    const limit = requested === 0
      ? MAX_PROFILE_ITEMS
      : Math.max(1, Math.min(Number.isFinite(requested) ? requested : 100, MAX_PROFILE_ITEMS));

    const result = await runYtDlpProfile(profileUrl, limit);
    const entries = flattenEntries(result.entries || result).slice(0, limit);
    const items = entries.map((entry, index) => {
      const sourceUrl = mediaUrlForEntry(entry, platform, profileUrl);
      const entryId = String(entry.id || index + 1);
      const fallbackThumb = platform === 'youtube' && entryId
        ? `https://i.ytimg.com/vi/${entryId}/hqdefault.jpg`
        : '';
      return {
        id: entryId,
        title: entry.title || entry.description || `${platform} #${index + 1}`,
        sourceUrl,
        author: entry.uploader || entry.channel || entry.creator || result.uploader || result.channel || '',
        thumb: pickThumbnail(entry) || fallbackThumb,
        date: entry.upload_date || entry.release_date || '',
        duration: entry.duration || null,
        viewCount: entry.view_count || null,
      };
    }).filter(item => item.sourceUrl);

    if (!items.length) {
      throw new Error('Nenhum vídeo público foi encontrado. O perfil pode ser privado, exigir login ou estar bloqueado temporariamente.');
    }

    sendJson(res, 200, {
      ok: true,
      platform,
      profileTitle: result.title || result.uploader || result.channel || '',
      count: items.length,
      limitedTo: limit,
      items,
    });
  } catch (error) {
    sendJson(res, 422, { ok: false, error: error.message || String(error) });
  }
}

function proxyToCobalt(req, res) {
  const headers = { ...req.headers, host: `127.0.0.1:${COBALT_PORT}` };
  const upstream = http.request({
    hostname: '127.0.0.1',
    port: COBALT_PORT,
    path: req.url,
    method: req.method,
    headers,
  }, upstreamRes => {
    // O Cobalt já pode devolver seus próprios cabeçalhos CORS. Removemos-os
    // antes de aplicar os nossos; dois Access-Control-Allow-Origin viram
    // "*, *" no navegador e causam exatamente o erro genérico "Failed to fetch".
    const responseHeaders = { ...upstreamRes.headers };
    for (const name of Object.keys(responseHeaders)) {
      if (name.toLowerCase().startsWith('access-control-')) delete responseHeaders[name];
    }
    Object.assign(responseHeaders, corsHeaders());
    res.writeHead(upstreamRes.statusCode || 502, responseHeaders);
    upstreamRes.pipe(res);
  });
  upstream.on('error', error => {
    if (!res.headersSent) sendJson(res, 503, { status: 'error', error: { code: 'backend.starting', context: error.message } });
    else res.destroy(error);
  });
  req.pipe(upstream);
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders());
    res.end();
    return;
  }

  const requestUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  if (requestUrl.pathname === '/profile' && req.method === 'GET') {
    await handleProfile(req, res, requestUrl);
    return;
  }
  if (requestUrl.pathname === '/profile-health') {
    sendJson(res, 200, { ok: true, service: 'blind-engine-profile-backend' });
    return;
  }
  proxyToCobalt(req, res);
});

server.listen(FRONT_PORT, '0.0.0.0', () => {
  console.log(`[blind-engine] frontend listening on 0.0.0.0:${FRONT_PORT}; cobalt internal port ${COBALT_PORT}`);
});
