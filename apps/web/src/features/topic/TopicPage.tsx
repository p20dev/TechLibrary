import * as Tabs from '@radix-ui/react-tabs';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle2, ExternalLink, GitBranch, Shield, Sparkles } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../lib/api';

export function TopicPage() {
  const { slug = '' } = useParams();
  const { data: topic, isLoading, isError } = useQuery({ queryKey: ['topic', slug], queryFn: () => api.topic(slug) });
  if (isLoading) return <div className="page-state">Henter emne…</div>;
  if (isError || !topic) return <div className="page-state">Emnet blev ikke fundet. <Link to="/">Tilbage til biblioteket</Link></div>;
  const content = topic.content;
  return <article className="topic-page">
    <Link className="back-link" to="/"><ArrowLeft size={16}/>Bibliotek</Link>
    <header className="topic-hero">
      <div><div className="eyebrow"><span></span>{topic.domains.join(' · ')}</div><h1>{topic.title}</h1><p>{topic.summary}</p></div>
      <dl><div><dt>Type</dt><dd>{topic.type}</dd></div><div><dt>Version</dt><dd>{topic.currentVersion ?? 'Living standard'}</dd></div><div><dt>Revision</dt><dd>#{topic.revisionNumber}</dd></div><div><dt>Verificeret</dt><dd>{new Date(topic.verifiedAt).toLocaleDateString('da-DK')}</dd></div></dl>
    </header>
    <Tabs.Root defaultValue="overview" className="topic-tabs">
      <Tabs.List aria-label="Indholdsniveau"><Tabs.Trigger value="overview">Overblik</Tabs.Trigger><Tabs.Trigger value="deep">Fordybelse</Tabs.Trigger><Tabs.Trigger value="sources">Kilder <span>{topic.sources.length}</span></Tabs.Trigger></Tabs.List>
      <Tabs.Content value="overview" className="prose-grid">
        <section className="prose"><h2>What is {topic.title}?</h2><p className="lead">{content.introduction}</p><h2>Core concepts</h2><BulletList values={content.concepts}/><h2>Typical use cases</h2><BulletList values={content.useCases}/></section>
        <aside><InfoCard icon={<Sparkles/>} title="Strengths" values={content.benefits}/><InfoCard icon={<Shield/>} title="Considerations" values={content.limitations}/></aside>
      </Tabs.Content>
      <Tabs.Content value="deep" className="prose"><h2>Compatibility</h2><p>{content.compatibility}</p><h2>Requirements</h2><BulletList values={content.requirements}/><h2>When not to use it</h2><BulletList values={content.avoidWhen}/><h2>Security notes</h2><BulletList values={content.securityNotes}/>{content.examples.map((example) => <div key={example.title}><h2>{example.title}</h2><pre><code>{example.code}</code></pre></div>)}</Tabs.Content>
      <Tabs.Content value="sources" className="sources"><div className="source-intro"><GitBranch/><div><h2>Provenance</h2><p>Every source is attached to this exact revision and records what it supports.</p></div></div>{topic.sources.map((source) => <a key={source.id} href={source.url} target="_blank" rel="noreferrer" className="source-card"><div><span>{source.type.replace('_', ' ')}</span><h3>{source.title}</h3><p>{source.publisher} · verified {new Date(source.verifiedAt).toLocaleDateString('da-DK')}</p>{source.claims.map((claim) => <small key={claim}><CheckCircle2 size={13}/>{claim}</small>)}</div><ExternalLink/></a>)}</Tabs.Content>
    </Tabs.Root>
  </article>;
}

function BulletList({ values }: { values: string[] }) { return <ul>{values.map((value) => <li key={value}>{value}</li>)}</ul>; }
function InfoCard({ icon, title, values }: { icon: React.ReactNode; title: string; values: string[] }) { return <div className="info-card"><div className="info-title">{icon}<h3>{title}</h3></div><BulletList values={values}/></div>; }
