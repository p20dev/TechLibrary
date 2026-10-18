import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppLayout } from './ui/AppLayout';
import { LibraryPage } from './features/library/LibraryPage';
import { TopicPage } from './features/topic/TopicPage';
import { AdminPage } from './features/admin/AdminPage';
import './styles.css';

// Apply the persisted theme before React mounts to avoid a bright/dark flash on navigation.
try {
  const stored = JSON.parse(localStorage.getItem('tech-library-preferences') ?? '{}') as { state?: { theme?: 'dark' | 'light' } };
  const theme = stored.state?.theme ?? 'dark';
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
} catch {
  document.documentElement.dataset.theme = 'dark';
}

const router = createBrowserRouter([{ path: '/', element: <AppLayout />, children: [
  { index: true, element: <LibraryPage /> },
  { path: 'emne/:slug', element: <TopicPage /> },
  { path: 'favoritter', element: <LibraryPage favoritesOnly /> },
  { path: 'admin', element: <AdminPage /> }
]}]);
const client = new QueryClient({ defaultOptions: { queries: { staleTime: 60_000, retry: 1 } } });
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><QueryClientProvider client={client}><RouterProvider router={router} /></QueryClientProvider></React.StrictMode>);
