import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import CreateCapsule from './pages/CreateCapsule.jsx';
import ViewCapsule from './pages/ViewCapsule.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';

const RequireAuth = ({ children }) => {
  const { accessToken, loading } = useAuth();
  if (loading) return null;
  if (!accessToken) return <Navigate to="/login" replace />;
  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-slate-50">
        <Navbar />
        <main className="mx-auto max-w-5xl px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/create"
              element={(
                <RequireAuth>
                  <CreateCapsule />
                </RequireAuth>
              )}
            />
            <Route path="/capsule/:slug" element={<ViewCapsule />} />
            <Route
              path="/dashboard"
              element={(
                <RequireAuth>
                  <Dashboard />
                </RequireAuth>
              )}
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
};

export default App;
