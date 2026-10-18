import * as Tabs from '@radix-ui/react-tabs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Activity, Check, FileEdit, LogIn, RefreshCw, ShieldCheck, X } from 'lucide-react';
import { useState } from 'react';
import type { TopicRevisionInput, TopicType } from '@tech-library/contracts';
import { api } from '../../lib/api';

export function AdminPage() {
  const session = useQuery({ queryKey: ['admin-session'], queryFn: api.session, retry: false });
  if (session.isLoading) return <div className="page-state">Kontrollerer session…</div>;
  if (session.isError) return <Login onSuccess={() => session.refetch()}/>;
  if (!session.data) return <Login onSuccess={() => session.refetch()}/>;
  return <AdminWorkspace csrf={session.data.csrfToken}/>;
}

function Login({ onSuccess }: { onSuccess(): void }) {
  const [username, setUsername] = useState('admin'); const [password, setPassword] = useState(''); const [error, setError] = useState('');
  const submit = async (event: React.FormEvent) => { event.preventDefault(); setError(''); try { await api.login(username, password); onSuccess(); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Login mislykkedes'); } };
  return <section className="admin-login"><div className="login-panel"><span className="admin-icon"><ShieldCheck/></span><p className="kicker">Redaktion</p><h1>Velkommen tilbage</h1><p>Log ind for at gennemgå kilder, redigere udkast og publicere verificeret viden.</p><form onSubmit={submit}><label>Brugernavn<input autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)}/></label><label>Adgangskode<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)}/></label>{error && <p className="form-error">{error}</p>}<button className="primary-button"><LogIn size={17}/>Log ind</button></form></div></section>;
}

function AdminWorkspace({ csrf }: { csrf: string }) {
  const client = useQueryClient();
  const findings = useQuery({ queryKey: ['findings'], queryFn: api.findings });
  const poll = useMutation({ mutationFn: () => api.mutate('/source-poll', csrf) });
  const review = useMutation({ mutationFn: ({ id, action }: { id: string; action: string }) => api.mutate(`/findings/${id}/${action}`, csrf), onSuccess: () => client.invalidateQueries({ queryKey: ['findings'] }) });
  return <section className="admin-page"><header><div><p className="kicker">Kontrolrum</p><h1>Redaktion</h1><p>Ingen ændringer bliver publiceret uden et menneskeligt review.</p></div><button className="secondary-button" onClick={() => poll.mutate()} disabled={poll.isPending}><RefreshCw size={16}/>Scan officielle kilder</button></header>
    <div className="admin-stats"><div><Activity/><span><strong>{findings.data?.filter((item) => item.status === 'pending').length ?? 0}</strong>Afventer review</span></div><div><ShieldCheck/><span><strong>Manuel</strong>Publiceringspolitik</span></div><div><RefreshCw/><span><strong>24 timer</strong>Scanningsinterval</span></div></div>
    <Tabs.Root defaultValue="findings" className="admin-tabs"><Tabs.List><Tabs.Trigger value="findings">Kildefund</Tabs.Trigger><Tabs.Trigger value="editor">Nyt udkast</Tabs.Trigger></Tabs.List>
      <Tabs.Content value="findings"><div className="admin-list">{findings.isLoading && <p>Henter findings…</p>}{findings.data?.length === 0 && <div className="empty-state"><Check/><h2>Alt er gennemgået</h2><p>Der er ingen kildeændringer i kø.</p></div>}{findings.data?.map((finding) => <div className="finding" key={finding.id}><div><span className={`status ${finding.status}`}>{finding.status}</span><h3>{finding.title}</h3><p>{finding.summary}</p><a href={finding.source_url} target="_blank" rel="noreferrer">Åbn officiel kilde</a></div>{finding.status === 'pending' && <div className="finding-actions"><button onClick={() => review.mutate({ id: finding.id, action: 'reject' })}><X/>Afvis</button><button className="approve" onClick={() => review.mutate({ id: finding.id, action: 'approve' })}><Check/>Godkend fund</button></div>}</div>)}</div></Tabs.Content>
      <Tabs.Content value="editor"><DraftEditor csrf={csrf}/></Tabs.Content>
    </Tabs.Root>
  </section>;
}

function DraftEditor({ csrf }: { csrf: string }) {
  const [message, setMessage] = useState('');
  const create = useMutation({ mutationFn: (input: TopicRevisionInput) => api.createDraft(csrf, input), onSuccess: (result) => setMessage(`Udkast #${String(result.number)} blev oprettet. Revision-ID: ${String(result.id)}`) });
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const form = new FormData(event.currentTarget); const title = String(form.get('title')); const summary = String(form.get('summary')); const domain = String(form.get('domain')); const type = String(form.get('type')) as TopicType;
    create.mutate({ title, slug: String(form.get('slug')), summary, audience: ['beginner', 'intermediate', 'advanced'], type, domains: [domain], tags: [domain.toLowerCase(), type], aliases: [], currentVersion: String(form.get('version')) || null, supportedVersions: [], content: { introduction: String(form.get('introduction')), concepts: lines(form.get('concepts')), useCases: lines(form.get('useCases')), benefits: lines(form.get('benefits')), limitations: lines(form.get('limitations')), avoidWhen: lines(form.get('avoidWhen')), compatibility: String(form.get('compatibility')), requirements: lines(form.get('requirements')), examples: [], migrationNotes: [], deprecations: [], securityNotes: lines(form.get('securityNotes')) }, changeNote: String(form.get('changeNote')) });
  };
  return <form className="editor-form" onSubmit={submit}><div className="editor-heading"><FileEdit/><div><h2>Opret immutable revision</h2><p>Felter med flere værdier bruger én linje per punkt.</p></div></div><div className="form-grid"><Field name="title" label="Titel" required/><Field name="slug" label="Slug" placeholder="web-technology" required/><Field name="domain" label="Fagområde" required/><label>Type<select name="type" defaultValue="technology"><option value="technology">Teknologi</option><option value="framework">Framework</option><option value="library">Bibliotek</option><option value="language">Sprog</option><option value="runtime">Runtime</option><option value="tool">Værktøj</option><option value="platform">Platform</option><option value="standard">Standard</option><option value="practice">Praksis</option><option value="architecture">Arkitektur</option></select></label><Field name="version" label="Aktuel version"/><Field name="changeNote" label="Ændringsnote" required/></div><Text name="summary" label="Resumé" required/><Text name="introduction" label="Introduktion" required/><div className="form-grid"><Text name="concepts" label="Centrale begreber" required/><Text name="useCases" label="Anvendelser" required/><Text name="benefits" label="Fordele" required/><Text name="limitations" label="Begrænsninger" required/><Text name="avoidWhen" label="Fravalg" required/><Text name="requirements" label="Krav" required/><Text name="securityNotes" label="Sikkerhedsnoter" required/></div><Text name="compatibility" label="Kompatibilitet" required/>{create.error && <p className="form-error">{create.error.message}</p>}{message && <p className="form-success">{message}</p>}<button className="primary-button" disabled={create.isPending}>Opret udkast</button></form>;
}
const lines = (value: FormDataEntryValue | null) => String(value ?? '').split('\n').map((item) => item.trim()).filter(Boolean);
function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) { const { label, ...input } = props; return <label>{label}<input {...input}/></label>; }
function Text(props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) { const { label, ...input } = props; return <label>{label}<textarea rows={3} {...input}/></label>; }
