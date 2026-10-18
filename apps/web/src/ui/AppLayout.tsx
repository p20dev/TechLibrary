import { BookOpen, Github, ShieldCheck } from 'lucide-react';
import { Link, NavLink, Outlet } from 'react-router-dom';

export function AppLayout() {
  return <div className="app-shell">
    <header className="topbar">
      <Link className="brand" to="/"><span className="brand-mark">TL</span><span>Tech Library</span></Link>
      <nav aria-label="Primær navigation">
        <NavLink to="/" end><BookOpen size={17}/>Bibliotek</NavLink>
        <NavLink to="/admin"><ShieldCheck size={17}/>Redaktion</NavLink>
      </nav>
    </header>
    <main><Outlet /></main>
    <footer><span>Levende viden. Dokumenterede kilder.</span><a href="https://git.p20.dev/christian/TechLibrary" target="_blank" rel="noreferrer"><Github size={16}/>Kildekode</a></footer>
  </div>;
}
