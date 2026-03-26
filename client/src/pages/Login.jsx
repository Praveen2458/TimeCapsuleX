import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-md space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Login</h2>
        <p className="text-sm text-slate-400">Access your TimeCapsuleX dashboard.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-slate-800 bg-slate-950/60 p-4 text-sm">
        <div>
          <label className="mb-1 block text-slate-300">Email</label>
          <input
            type="email"
            className="w-full rounded-md border border-slate-800 bg-slate-950/40 p-2 text-sm outline-none ring-sky-500/60 focus:ring"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-slate-300">Password</label>
          <input
            type="password"
            className="w-full rounded-md border border-slate-800 bg-slate-950/40 p-2 text-sm outline-none ring-sky-500/60 focus:ring"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 shadow-sm shadow-sky-500/40 transition hover:bg-sky-400 disabled:cursor-wait disabled:opacity-60"
        >
          {loading ? 'Logging in…' : 'Login'}
        </button>
        <p className="pt-2 text-xs text-slate-400">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-sky-400 hover:underline">
            Register
          </Link>
        </p>
      </form>
    </section>
  );
};

export default Login;
