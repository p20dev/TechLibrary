import { useDeferredValue, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Dices, Search, SlidersHorizontal, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { api, userApi } from '../../lib/api';
import { useUiStore } from '../../store/ui';
import { useText } from '../../store/preferences';
import { Badge } from '../../ui/components/badge';
import { Button } from '../../ui/components/button';
import { Input } from '../../ui/components/input';

const accents = ['violet', 'cyan', 'amber', 'lime', 'rose'];
export function LibraryPage({ favoritesOnly = false }: { favoritesOnly?: boolean }) {
  const { language, t } = useText(); const navigate = useNavigate(); const [query, setQuery] = useState(''); const search = useDeferredValue(query); const { domain, type, setDomain, setType, clear } = useUiStore();
  const params = new URLSearchParams({ pageSize: '50', lang: language }); if (search) params.set('q', search); if (domain) params.set('domain', domain); if (type) params.set('type', type);
  const topics = useQuery({ queryKey: ['topics', language, search, domain, type], queryFn: () => api.topics(params), enabled: !favoritesOnly });
  const favorites = useQuery({ queryKey: ['favorites', language], queryFn: () => userApi.favorites(language), enabled: favoritesOnly }); const facets = useQuery({ queryKey: ['facets'], queryFn: api.facets });
  const items = useMemo(() => favoritesOnly ? (favorites.data ?? []) : (topics.data?.items ?? []), [favoritesOnly, favorites.data, topics.data]); const total = favoritesOnly ? items.length : (topics.data?.total ?? 0); const loading = favoritesOnly ? favorites.isLoading : topics.isLoading; const failed = favoritesOnly ? favorites.isError : topics.isError;
  const surprise = () => { if (items.length) navigate(`/emne/${items[Math.floor(Math.random() * items.length)].slug}`); };
  return <div className="library-page"><header className="discovery-header"><div><Badge>{t.sourceLibrary}</Badge><h1>{favoritesOnly ? t.favorites : <>{t.headline} <span>{t.headlineAccent}</span></>}</h1><p>{t.intro}</p></div>{!favoritesOnly && <Button variant="outline" onClick={surprise} disabled={!items.length}><Dices/>{language === 'da' ? 'Overrask mig' : 'Surprise me'}</Button>}</header>
    <div className="discovery-tools"><label className="searchbox"><Search/><span className="sr-only">Search</span><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.search}/></label><span className="result-count">{total} {t.results}</span></div>
    <section className="library-layout"><aside className="filters" aria-label="Filtre"><div className="filter-title"><span><SlidersHorizontal/>{t.filters}</span>{(domain || type) && <Button variant="ghost" size="sm" onClick={clear}><X/>{t.reset}</Button>}</div><FilterGroup title={t.domain} value={domain} items={facets.data?.domains ?? []} onChange={setDomain}/><FilterGroup title={t.type} value={type} items={facets.data?.types ?? []} onChange={setType}/></aside>
      <div className="catalog"><div className="catalog-header"><div><p className="kicker">{domain || (favoritesOnly ? t.favorites : t.library)}</p><h2>{favoritesOnly ? t.favorites : domain || t.allTopics}</h2></div></div>{loading && <div className="state-card">{t.loading}</div>}{failed && <div className="state-card error">Library unavailable.</div>}<div className="topic-grid">{items.map((topic, index) => <Link className={`topic-card accent-${accents[index % accents.length]}`} to={`/emne/${topic.slug}`} key={topic.id} style={{ '--delay': `${Math.min(index, 12) * 25}ms` } as React.CSSProperties}><div className="card-top"><Badge>{labelType(topic.type)}</Badge><span className="card-arrow"><ArrowRight/></span></div><div className="topic-symbol" aria-hidden="true">{topic.title.slice(0, 2).toUpperCase()}</div><h3>{topic.title}</h3><p>{topic.summary}</p><div className="tag-row">{topic.domains.map((value) => <span key={value}>{value}</span>)}</div></Link>)}</div>{items.length === 0 && !loading && <div className="state-card">{favoritesOnly ? t.noFavorites : t.noResults}</div>}</div>
    </section></div>;
}
function FilterGroup({ title, items, value, onChange }: { title: string; items: Array<{ value: string; count: number }>; value: string; onChange(value: string): void }) { return <fieldset><legend>{title}</legend>{items.map((item) => <label key={item.value}><input type="radio" name={title} checked={value === item.value} onChange={() => onChange(value === item.value ? '' : item.value)}/><span>{labelType(item.value)}</span><small>{item.count}</small></label>)}</fieldset>; }
const labelType = (value: string) => ({ technology: 'Teknologi', framework: 'Framework', library: 'Bibliotek', language: 'Sprog', runtime: 'Runtime', tool: 'Værktøj', platform: 'Platform', standard: 'Standard', practice: 'Praksis', architecture: 'Arkitektur' }[value] ?? value);
