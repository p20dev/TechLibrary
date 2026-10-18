import * as Dialog from '@radix-ui/react-dialog';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BookOpen, Github, Heart, LogIn, LogOut, ShieldCheck, UserRound, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { userApi } from '../lib/api';
import { usePreferences, useText } from '../store/preferences';

export function AppLayout() {
  const { language, t } = useText(); const setLanguage = usePreferences((state) => state.setLanguage); const client = useQueryClient();
  const session = useQuery({ queryKey: ['user-session'], queryFn: userApi.me, retry: false });
  const logout = useMutation({ mutationFn: () => userApi.logout(session.data!.csrfToken), onSuccess: () => { client.setQueryData(['user-session'], null); client.invalidateQueries({ queryKey: ['topics'] }); } });
  return <div className="app-shell"><header className="topbar"><Link className="brand" to="/"><span className="brand-mark">TL</span><span>Tech Library</span></Link><nav aria-label="Primary navigation"><NavLink to="/" end><BookOpen size={17}/>{t.library}</NavLink>{session.data && <NavLink to="/favoritter"><Heart size={17}/>{t.favorites}</NavLink>}<NavLink to="/admin"><ShieldCheck size={17}/>{t.editorial}</NavLink><div className="language-switch"><button className={language === 'da' ? 'active' : ''} onClick={() => setLanguage('da')}>DA</button><button className={language === 'en' ? 'active' : ''} onClick={() => setLanguage('en')}>EN</button></div>{session.data ? <button className="account-button" onClick={() => logout.mutate()} title={t.logout}><LogOut size={17}/><span>{session.data.username}</span></button> : <AccountDialog/>}</nav></header><main><Outlet /></main><footer><span>Living knowledge. Documented sources.</span><a href="https://git.p20.dev/christian/TechLibrary" target="_blank" rel="noreferrer"><Github size={16}/>Source</a></footer></div>;
}

function AccountDialog() {
  const { t } = useText(); const client = useQueryClient(); const [open, setOpen] = useState(false); const [mode, setMode] = useState<'login' | 'register'>('login'); const [error, setError] = useState('');
  const authenticate = useMutation({ mutationFn: ({ username, password }: { username: string; password: string }) => userApi.authenticate(mode, username, password), onSuccess: (data) => { client.setQueryData(['user-session'], data); client.invalidateQueries({ queryKey: ['topics'] }); setOpen(false); }, onError: (reason) => setError(reason instanceof Error ? reason.message : 'Authentication failed') });
  return <Dialog.Root open={open} onOpenChange={setOpen}><Dialog.Trigger asChild><button className="account-button"><UserRound size={17}/><span>{t.login}</span></button></Dialog.Trigger><Dialog.Portal><Dialog.Overlay className="dialog-overlay"/><Dialog.Content className="account-dialog"><Dialog.Close className="dialog-close"><X/></Dialog.Close><Dialog.Title>{t.accountTitle}</Dialog.Title><Dialog.Description>{mode === 'login' ? t.loginHint : '3–32 characters. Password: minimum 8 characters.'}</Dialog.Description><form onSubmit={(event) => { event.preventDefault(); setError(''); const data = new FormData(event.currentTarget); authenticate.mutate({ username: String(data.get('username')), password: String(data.get('password')) }); }}><label>{t.username}<input name="username" autoComplete="username" required/></label><label>{t.password}<input name="password" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={8} required/></label>{error && <p className="form-error">{error}</p>}<button className="primary-button" disabled={authenticate.isPending}><LogIn/>{mode === 'login' ? t.login : t.register}</button></form><button className="mode-switch" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>{mode === 'login' ? t.register : t.login}</button></Dialog.Content></Dialog.Portal></Dialog.Root>;
}
