import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { PrivateRoute } from './components/PrivateRoute';
import { Layout } from './components/Layout';
import Login from './pages/Login';
import Chat from './pages/Chat';
import Files from './pages/Files';
import Projects from './pages/Projects';
import Dashboard from './pages/dashboard/Billing';
import Companies from './pages/admin/Companies';
import TestModals from './pages/TestModals';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/test-modals" element={<TestModals />} />
            <Route path="/login" element={<Login />} />
            <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route path="/chat" element={<Chat />} />
              <Route path="/files" element={<Files />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/dashboard/*" element={<Dashboard />} />
              <Route path="/admin/empresas" element={<Companies />} />
              <Route path="/" element={<Navigate to="/chat" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
