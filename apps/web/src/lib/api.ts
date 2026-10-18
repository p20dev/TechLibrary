import type { Paginated, TopicDetail, TopicListItem, TopicRevisionInput } from '@tech-library/contracts';

const json = async <T>(pending: Response | Promise<Response>): Promise<T> => {
  const response = await pending;
  if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error ?? `HTTP ${response.status}`);
  return response.json() as Promise<T>;
};

export const api = {
  topics: (params: URLSearchParams) => json<Paginated<TopicListItem>>(fetch(`/api/v1/topics?${params}`)),
  topic: (slug: string) => json<TopicDetail>(fetch(`/api/v1/topics/${slug}`)),
  revisions: (slug: string) => json<Array<{ id: string; number: number; status: string; changeNote: string; createdAt: string; active: number }>>(fetch(`/api/v1/topics/${slug}/revisions`)),
  facets: () => json<{ domains: Array<{ value: string; count: number }>; types: Array<{ value: string; count: number }> }>(fetch('/api/v1/facets')),
  login: (username: string, password: string) => json<{ csrfToken: string }>(fetch('/api/v1/admin/login', { method: 'POST', headers: { 'content-type': 'application/json' }, credentials: 'include', body: JSON.stringify({ username, password }) })),
  session: () => json<{ csrfToken: string }>(fetch('/api/v1/admin/session', { credentials: 'include' })),
  findings: () => json<Array<Record<string, string>>>(fetch('/api/v1/admin/findings', { credentials: 'include' })),
  mutate: (path: string, csrfToken: string, body?: unknown) => json<Record<string, unknown>>(fetch(`/api/v1/admin${path}`, { method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json', 'x-csrf-token': csrfToken }, body: body === undefined ? undefined : JSON.stringify(body) })),
  createDraft: (csrfToken: string, input: TopicRevisionInput) => api.mutate('/revisions', csrfToken, input)
};
