import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Layout from './components/Layout';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import PrivateRoute from './components/PrivateRoute';

const Chat = lazy(() => import('./pages/Chat'));
const Search = lazy(() => import('./pages/Search'));
const Assistants = lazy(() => import('./pages/Assistants'));
const ArchivedChats = lazy(() => import('./pages/ArchivedChats'));
const Files = lazy(() => import('./pages/Files'));
const Projects = lazy(() => import('./pages/Projects'));
const Billing = lazy(() => import('./pages/dashboard/Billing'));
const MasterTokenDashboard = lazy(() => import('./pages/admin/MasterTokenDashboard'));
const Login = lazy(() => import('./pages/Login'));

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <Suspense fallback={
            <div className="flex h-screen w-screen items-center justify-center bg-slate-900 text-white">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            </div>
          }>
            <Routes>
              <Route path="/login" element={<Login />} />

              <Route element={<PrivateRoute />}>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Navigate to="/chat" replace />} />
                  <Route path="chat" element={<Chat />} />
                  <Route path="search" element={<Search />} />
                  <Route path="assistants" element={<Assistants />} />
                  <Route path="archived" element={<ArchivedChats />} />
                  <Route path="files" element={<Files />} />
                  <Route path="projects" element={<Projects />} />
                  <Route path="dashboard/billing" element={<Billing />} />
                  <Route path="admin/tokens" element={<MasterTokenDashboard />} />
                </Route>
              </Route>
            </Routes>
          </Suspense>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
