'use client';

import { createClient, type Client } from 'graphql-ws';

const HTTP_ENDPOINT =
  'https://23019154-5b6e-4edb-a020-f889c237c21c.squids.live/puppynet-prediction-squid@v2/api/graphql';
const WS_ENDPOINT = HTTP_ENDPOINT.replace(/^http/, 'ws');

let _client: Client | null = null;

export function getWsClient(): Client | null {
  // doppia guard per sicurezza
  if (typeof window === 'undefined') return null;
  if (_client) return _client;

  _client = createClient({
    url: WS_ENDPOINT,
    lazy: true,
    keepAlive: 12_000,
    retryAttempts: Infinity,
    retryWait: (retries) =>
      new Promise((r) => setTimeout(r, Math.min(1000 * 2 ** retries, 30_000))),
    // connectionParams: async () => ({ headers: { Authorization: `Bearer ${token}` } }),
  });

  return _client;
}
