import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppLayout } from './ui/AppLayout';
import { LibraryPage } from './features/library/LibraryPage';
import { TopicPage } from './features/topic/TopicPage';
import { AdminPage } from './features/admin/AdminPage';
import './styles.css';

const router = createBrowserRouter([{ path: '/', element: <AppLayout />, children: [
  { index: true, element: <LibraryPage /> },
  { path: 'emne/:slug', element: <TopicPage /> },
  { path: 'admin', element: <AdminPage /> }
]}]);
const client = new QueryClient({ defaultOptions: { queries: { staleTime: 60_000, retry: 1 } } });
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><QueryClientProvider client={client}><RouterProvider router={router} /></QueryClientProvider></React.StrictMode>);
