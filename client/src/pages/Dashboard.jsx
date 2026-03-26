import { useEffect, useState } from 'react';
import { getMyCapsules } from '../services/api.js';

const Dashboard = () => {
  const [capsules, setCapsules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCapsules = async () => {
      try {
        const res = await getMyCapsules();
        setCapsules(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load capsules');
      } finally {
        setLoading(false);
      }
    };

    fetchCapsules();
  }, []);

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
        <p className="text-sm text-slate-400">Your created capsules</p>
      </div>

      {loading ? (
        <div className="h-24 animate-pulse rounded-md bg-slate-900/60" />
      ) : error ? (
        <p className="text-sm text-red-400">{error}</p>
      ) : capsules.length === 0 ? (
        <p className="text-sm text-slate-400">You have not created any capsules yet.</p>
      ) : (
        <ul className="space-y-3 text-sm">
          {capsules.map((capsule) => (
            <li
              key={capsule._id}
              className="flex items-center justify-between gap-4 rounded-md border border-slate-800 bg-slate-950/40 px-3 py-2"
            >
              <div>
                <p className="font-medium text-slate-100">{capsule.slug}</p>
                <p className="text-xs text-slate-400">
                  Unlocks at {new Date(capsule.unlockAt).toLocaleString()} • Views: {capsule.views}
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  Link:{' '}
                  <a
                    href={`${window.location.origin}/capsule/${capsule.slug}`}
                    className="break-all text-sky-400 hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {`${window.location.origin}/capsule/${capsule.slug}`}
                  </a>
                </p>
              </div>
              <span
                className="rounded-full bg-slate-800 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-slate-300"
              >
                {new Date() >= new Date(capsule.unlockAt) ? 'Unlocked' : 'Locked'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default Dashboard;
