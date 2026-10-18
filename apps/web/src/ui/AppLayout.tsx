import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BookOpen, Compass, Github, Heart, LogIn, LogOut, Moon, ShieldCheck, Sun, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { userApi } from '../lib/api';
import { usePreferences, useText } from '../store/preferences';
import { Button } from './components/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from './components/dialog';
import { Input } from './components/input';

export function AppLayout() {
  const { language, t } = useText(); const { theme, setLanguage, setTheme } = usePreferences(); const client = useQueryClient();
  useEffect(() => { document.documentElement.dataset.theme = theme; document.documentElement.style.colorScheme = theme; }, [theme]);
  const session = useQuery({ queryKey: ['user-session'], queryFn: userApi.me, retry: false });
  const logout = useMutation({ mutationFn: () => userApi.logout(session.data!.csrfToken), onSuccess: () => { client.setQueryData(['user-session'], null); client.invalidateQueries({ queryKey: ['topics'] }); } });
  return <div className="app-shell"><aside className="sidebar">
    <Link className="brand" to="/"><span className="brand-mark"><BookOpen/></span><span>Tech Library</span></Link>
    <nav aria-label="Primary navigation"><NavLink to="/" end><Compass/>{t.library}</NavLink>{session.data && <NavLink to="/favoritter"><Heart/>{t.favorites}</NavLink>}<NavLink to="/admin"><ShieldCheck/>{t.editorial}</NavLink></nav>
    <div className="sidebar-bottom"><ThemeToggle theme={theme} label={theme === 'dark' ? t.lightMode : t.darkMode} onToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')}/><div className="language-switch"><button className={language === 'da' ? 'active' : ''} onClick={() => setLanguage('da')}>DA</button><button className={language === 'en' ? 'active' : ''} onClick={() => setLanguage('en')}>EN</button></div>{session.data ? <Button variant="ghost" className="account-button" onClick={() => logout.mutate()} title={t.logout}><LogOut/><span>{session.data.username}</span></Button> : <AccountDialog/>}<a className="source-link" href="https://git.p20.dev/christian/TechLibrary" target="_blank" rel="noreferrer"><Github/>Source</a></div>
  </aside><header className="mobile-topbar"><Link className="brand" to="/"><span className="brand-mark"><BookOpen/></span><span>Tech Library</span></Link><nav>{/* Mobile navigation stays deliberately compact. */}<ThemeToggle theme={theme} label={theme === 'dark' ? t.lightMode : t.darkMode} onToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')}/><NavLink to="/"><Compass/></NavLink><NavLink to="/admin"><ShieldCheck/></NavLink></nav></header><main className="app-main"><Outlet/></main></div>;
}

function ThemeToggle({ theme, label, onToggle }: { theme: 'dark' | 'light'; label: string; onToggle(): void }) {
  return <Button variant="ghost" className="theme-toggle" onClick={onToggle} aria-label={label} title={label}>{theme === 'dark' ? <Sun/> : <Moon/>}<span>{theme === 'dark' ? 'Light' : 'Dark'}</span></Button>;
}

function AccountDialog() {
  const { t } = useText(); const client = useQueryClient(); const [open, setOpen] = useState(false); const [mode, setMode] = useState<'login' | 'register'>('login'); const [error, setError] = useState('');
  const authenticate = useMutation({ mutationFn: ({ username, password }: { username: string; password: string }) => userApi.authenticate(mode, username, password), onSuccess: (data) => { client.setQueryData(['user-session'], data); client.invalidateQueries({ queryKey: ['topics'] }); setOpen(false); }, onError: (reason) => setError(reason instanceof Error ? reason.message : 'Authentication failed') });
  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button variant="ghost" className="account-button"><UserRound/><span>{t.login}</span></Button></DialogTrigger><DialogContent><DialogTitle>{t.accountTitle}</DialogTitle><DialogDescription>{mode === 'login' ? t.loginHint : '3–32 characters. Password: minimum 8 characters.'}</DialogDescription><form onSubmit={(event) => { event.preventDefault(); setError(''); const data = new FormData(event.currentTarget); authenticate.mutate({ username: String(data.get('username')), password: String(data.get('password')) }); }}><label>{t.username}<Input name="username" autoComplete="username" required/></label><label>{t.password}<Input name="password" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={8} required/></label>{error && <p className="form-error">{error}</p>}<Button disabled={authenticate.isPending}><LogIn/>{mode === 'login' ? t.login : t.register}</Button></form><Button variant="ghost" className="mode-switch" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>{mode === 'login' ? t.register : t.login}</Button></DialogContent></Dialog>;
}
