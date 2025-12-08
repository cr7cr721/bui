import { http, HttpResponse } from 'msw'

const BASE = 'https://gdp-beam-api.dev.data.blz.dev'

export const handlers = [
  http.post(`${BASE}/user/login`, async () => HttpResponse.json({ token: 'test-token' })),
  http.get(`${BASE}/rules`, () => HttpResponse.json([])),
]
