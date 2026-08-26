/**
 * PXLRogue High Score Proxy - Vercel Serverless Function
 */
const { handleRequest } = require('../serverless/scores_service.js');

module.exports = async function handler(req, res) {
  // Convert Node req/res to Web Request/Response
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
  const url = `${protocol}://${host}${req.url || '/api/scores'}`;

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) {
      value.forEach(v => headers.append(key, v));
    } else if (value !== undefined) {
      headers.set(key, value);
    }
  }

  let body = null;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    if (typeof req.body === 'object' && req.body !== null) {
      body = JSON.stringify(req.body);
    } else if (typeof req.body === 'string') {
      body = req.body;
    }
  }

  const webRequest = new Request(url, {
    method: req.method,
    headers,
    body: body || undefined
  });

  const response = await handleRequest(webRequest, process.env);

  res.status(response.status);
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  const responseText = await response.text();
  res.send(responseText);
};
