// Vercel serverless function — proxies football-data.org and injects the API key server-side.
// Set FOOTBALL_API_KEY in Vercel project settings → Environment Variables.
// For local dev, add FOOTBALL_API_KEY=your_key to .env.local

module.exports = async function handler(req, res) {
  const segments = Array.isArray(req.query.path)
    ? req.query.path
    : [req.query.path].filter(Boolean);

  // Forward query params, excluding the catch-all 'path' param added by Vercel
  const params = new URLSearchParams();
  for (const [key, val] of Object.entries(req.query)) {
    if (key !== 'path') params.append(key, val);
  }

  const qs = params.toString();
  const apiUrl = `https://api.football-data.org/v4/${segments.join('/')}${qs ? `?${qs}` : ''}`;

  const apiRes = await fetch(apiUrl, {
    headers: { 'X-Auth-Token': process.env.FOOTBALL_API_KEY || '' },
  });

  const data = await apiRes.json();

  const cc = apiRes.headers.get('cache-control');
  if (cc) res.setHeader('Cache-Control', cc);

  res.status(apiRes.status).json(data);
};
