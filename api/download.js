// ============================================
// Vercel Serverless Function — /api/download
// ============================================
// Note: On Vercel, this endpoint generates the ZIP in-memory
// since serverless functions don't have persistent filesystem.
// The frontend should pass fileContents from the /api/build response.

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // In serverless mode, download is handled client-side
  // The /api/build endpoint returns full file contents
  // The frontend generates the ZIP in the browser using JSZip
  return res.status(200).json({
    message: 'In Vercel deployment, downloads are handled client-side. Use the fileContents from /api/build response with JSZip.',
    docs: 'See frontend downloadProjectZip() for client-side ZIP generation.',
  });
}
