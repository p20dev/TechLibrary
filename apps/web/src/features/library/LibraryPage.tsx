import { useDeferredValue, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, Search, SlidersHorizontal, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { useUiStore } from '../../store/ui';

export function LibraryPage() {
  const [query, setQuery] = useState('');
  const search = useDeferredValue(query);
  const { domain, type, setDomain, setType, clear } = useUiStore();
  const params = new URLSearchParams({ pageSize: '50' });
  if (search) params.set('q', search);
  if (domain) params.set('domain', domain);
  if (type) params.set('type', type);
  const topics = useQuery({ queryKey: ['topics', search, domain, type], queryFn: () => api.topics(params) });
  const facets = useQuery({ queryKey: ['facets'], queryFn: api.facets });

  return <>
    <section className="hero">
      <div className="eyebrow"><span></span>Et levende teknisk opslagsværk</div>
      <h1>Forstå teknologien.<br/><em>Se hele sammenhængen.</em></h1>
      <p>Kurateret viden om moderne web-, app- og systemudvikling — fra første begreb til arkitekturbeslutning. Hvert udsagn føres tilbage til sin kilde.</p>
      <label className="searchbox"><Search aria-hidden="true"/><span className="sr-only">Søg i biblioteket</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Søg efter React, databaser, sikkerhed…"/><kbd>⌘ K</kbd></label>
      <div className="hero-meta"><span>{topics.data?.total ?? '—'} kuraterede emner</span><span>•</span><span>Officielle primærkilder</span><span>•</span><span>Løbende verificeret</span></div>
    </section>

    <section className="library-layout">
      <aside className="filters" aria-label="Filtre">
        <div className="filter-title"><span><SlidersHorizontal size={16}/>Filtrér</span>{(domain || type) && <button onClick={clear}><X size={14}/>Nulstil</button>}</div>
        <FilterGroup title="Fagområde" value={domain} items={facets.data?.domains ?? []} onChange={setDomain}/>
        <FilterGroup title="Type" value={type} items={facets.data?.types ?? []} onChange={setType}/>
      </aside>
      <div className="catalog">
        <div className="catalog-header"><div><p className="kicker">Biblioteket</p><h2>{domain || 'Alle emner'}</h2></div><span>{topics.data?.total ?? 0} resultater</span></div>
        {topics.isLoading && <div className="state-card">Henter biblioteket…</div>}
        {topics.isError && <div className="state-card error">Biblioteket kunne ikke hentes. Kontrollér forbindelsen og prøv igen.</div>}
        <div className="topic-grid">{topics.data?.items.map((topic, index) => <Link className="topic-card" to={`/emne/${topic.slug}`} key={topic.id} style={{ '--delay': `${Math.min(index, 12) * 25}ms` } as React.CSSProperties}>
          <div className="card-top"><span className="type-badge">{labelType(topic.type)}</span><ArrowUpRight size={18}/></div>
          <h3>{topic.title}</h3><p>{topic.summary}</p>
          <div className="tag-row">{topic.domains.map((value) => <span key={value}>{value}</span>)}</div>
          <div className="verified">Verificeret {new Date(topic.verifiedAt).toLocaleDateString('da-DK')}</div>
        </Link>)}</div>
        {topics.data?.items.length === 0 && <div className="state-card">Ingen emner matcher din søgning.</div>}
      </div>
    </section>
  </>;
}

function FilterGroup({ title, items, value, onChange }: { title: string; items: Array<{ value: string; count: number }>; value: string; onChange(value: string): void }) {
  return <fieldset><legend>{title}</legend>{items.map((item) => <label key={item.value}><input type="radio" name={title} checked={value === item.value} onChange={() => onChange(value === item.value ? '' : item.value)}/><span>{labelType(item.value)}</span><small>{item.count}</small></label>)}</fieldset>;
}
const labelType = (value: string) => ({ technology: 'Teknologi', framework: 'Framework', library: 'Bibliotek', language: 'Sprog', runtime: 'Runtime', tool: 'Værktøj', platform: 'Platform', standard: 'Standard', practice: 'Praksis', architecture: 'Arkitektur' }[value] ?? value);
