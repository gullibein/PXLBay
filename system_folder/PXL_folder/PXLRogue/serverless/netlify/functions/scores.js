/**
 * PXLRogue High Score Proxy - Netlify Function
 */
const { handleRequest, CORS_HEADERS } = require('../../scores_service.js');

exports.handler = async function (event, context) {
  const method = event.httpMethod || 'GET';
  const url = `https://${event.headers.host || 'localhost'}${event.path}`;

  const headers = new Headers();
  for (const [k, v] of Object.entries(event.headers || {})) {
    headers.set(k, v);
  }

  const webRequest = new Request(url, {
    method,
    headers,
    body: event.body || undefined
  });

  const response = await handleRequest(webRequest, process.env);
  const responseBody = await response.text();

  const outHeaders = {};
  response.headers.forEach((value, key) => {
    outHeaders[key] = value;
  });

  return {
    statusCode: response.status,
    headers: outHeaders,
    body: responseBody
  };
};
