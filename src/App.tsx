import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Chat from './pages/Chat';
import Files from './pages/Files';
import Assistants from './pages/Assistants';
import Projects from './pages/Projects';
import Billing from './pages/dashboard/Billing';
import Companies from './pages/admin/Companies';
import Login from './pages/Login';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ChatProvider } from './contexts/ChatContext';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <ChatProvider>
            <Routes>
              <Route path="/login" element={<Login />} />

              <Route element={<PrivateRoute />}>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Navigate to="/chat" replace />} />
                  <Route path="chat" element={<Chat />} />
                  <Route path="chat/:conversationId" element={<Chat />} />
                  <Route path="files" element={<Files />} />
                  <Route path="assistants" element={<Assistants />} />
                  <Route path="projects" element={<Projects />} />
                  <Route path="dashboard/billing" element={<Billing />} />
                  <Route path="super-admin/companies" element={<Companies />} />
                </Route>
              </Route>
            </Routes>
          </ChatProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
