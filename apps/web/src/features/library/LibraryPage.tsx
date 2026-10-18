import { useDeferredValue, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, Search, SlidersHorizontal, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api, userApi } from '../../lib/api';
import { useUiStore } from '../../store/ui';
import { useText } from '../../store/preferences';

export function LibraryPage({ favoritesOnly = false }: { favoritesOnly?: boolean }) {
  const { language, t } = useText();
  const [query, setQuery] = useState('');
  const search = useDeferredValue(query);
  const { domain, type, setDomain, setType, clear } = useUiStore();
  const params = new URLSearchParams({ pageSize: '50' });
  if (search) params.set('q', search);
  if (domain) params.set('domain', domain);
  if (type) params.set('type', type);
  params.set('lang', language);
  const topics = useQuery({ queryKey: ['topics', language, search, domain, type], queryFn: () => api.topics(params), enabled: !favoritesOnly });
  const favorites = useQuery({ queryKey: ['favorites', language], queryFn: () => userApi.favorites(language), enabled: favoritesOnly });
  const facets = useQuery({ queryKey: ['facets'], queryFn: api.facets });
  const items = favoritesOnly ? (favorites.data ?? []) : (topics.data?.items ?? []); const total = favoritesOnly ? items.length : (topics.data?.total ?? 0); const loading = favoritesOnly ? favorites.isLoading : topics.isLoading; const failed = favoritesOnly ? favorites.isError : topics.isError;

  return <>
    <section className="hero">
      <div className="eyebrow"><span></span>{t.sourceLibrary}</div>
      <h1>{favoritesOnly ? t.favorites : t.headline}<br/><em>{favoritesOnly ? '' : t.headlineAccent}</em></h1>
      <p>{t.intro}</p>
      <label className="searchbox"><Search aria-hidden="true"/><span className="sr-only">Search</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.search}/><kbd>⌘ K</kbd></label>
      <div className="hero-meta"><span>{total || '—'} {t.curated}</span><span>•</span><span>{t.official}</span><span>•</span><span>{t.verified}</span></div>
    </section>

    <section className="library-layout">
      <aside className="filters" aria-label="Filtre">
        <div className="filter-title"><span><SlidersHorizontal size={16}/>{t.filters}</span>{(domain || type) && <button onClick={clear}><X size={14}/>{t.reset}</button>}</div>
        <FilterGroup title={t.domain} value={domain} items={facets.data?.domains ?? []} onChange={setDomain}/>
        <FilterGroup title={t.type} value={type} items={facets.data?.types ?? []} onChange={setType}/>
      </aside>
      <div className="catalog">
        <div className="catalog-header"><div><p className="kicker">{t.library}</p><h2>{favoritesOnly ? t.favorites : domain || t.allTopics}</h2></div><span>{total} {t.results}</span></div>
        {loading && <div className="state-card">{t.loading}</div>}
        {failed && <div className="state-card error">Library unavailable.</div>}
        <div className="topic-grid">{items.map((topic, index) => <Link className="topic-card" to={`/emne/${topic.slug}`} key={topic.id} style={{ '--delay': `${Math.min(index, 12) * 25}ms` } as React.CSSProperties}>
          <div className="card-top"><span className="type-badge">{labelType(topic.type)}</span><ArrowUpRight size={18}/></div>
          <h3>{topic.title}</h3><p>{topic.summary}</p>
          <div className="tag-row">{topic.domains.map((value) => <span key={value}>{value}</span>)}</div>
          <div className="verified">Verificeret {new Date(topic.verifiedAt).toLocaleDateString('da-DK')}</div>
        </Link>)}</div>
        {items.length === 0 && !loading && <div className="state-card">{favoritesOnly ? t.noFavorites : t.noResults}</div>}
      </div>
    </section>
  </>;
}

function FilterGroup({ title, items, value, onChange }: { title: string; items: Array<{ value: string; count: number }>; value: string; onChange(value: string): void }) {
  return <fieldset><legend>{title}</legend>{items.map((item) => <label key={item.value}><input type="radio" name={title} checked={value === item.value} onChange={() => onChange(value === item.value ? '' : item.value)}/><span>{labelType(item.value)}</span><small>{item.count}</small></label>)}</fieldset>;
}
const labelType = (value: string) => ({ technology: 'Teknologi', framework: 'Framework', library: 'Bibliotek', language: 'Sprog', runtime: 'Runtime', tool: 'Værktøj', platform: 'Platform', standard: 'Standard', practice: 'Praksis', architecture: 'Arkitektur' }[value] ?? value);
