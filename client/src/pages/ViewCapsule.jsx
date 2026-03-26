import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CountdownTimer from '../components/CountdownTimer.jsx';
import CapsuleViewer from '../components/CapsuleViewer.jsx';
import { getCapsule, unlockCapsule } from '../services/api.js';

const ViewCapsule = () => {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(true);
  const [unlockAt, setUnlockAt] = useState(null);
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [destroyed, setDestroyed] = useState(false);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [unlockLoading, setUnlockLoading] = useState(false);

  const fetchCapsule = async () => {
    try {
      setLoading(true);
      const res = await getCapsule(slug);
      const data = res.data;
      setLocked(data.locked);
      setPasswordRequired(data.passwordRequired);
      setUnlockAt(data.unlockAt);
      if (!data.locked && !data.passwordRequired) {
        setContent(data.content);
        setMediaUrl(data.mediaUrl);
      }
    } catch (err) {
      if (err.response?.status === 410) {
        setDestroyed(true);
      } else {
        setError(err.response?.data?.message || 'Failed to load capsule');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCapsule();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const handleUnlock = async (e) => {
    e.preventDefault();
    setUnlockLoading(true);
    setError('');
    try {
      const res = await unlockCapsule(slug, password);
      const data = res.data;
      setLocked(data.locked);
      setPasswordRequired(false);
      setContent(data.content);
      setMediaUrl(data.mediaUrl);
    } catch (err) {
      if (err.response?.status === 410) {
        setDestroyed(true);
      } else {
        setError(err.response?.data?.message || 'Failed to unlock capsule');
      }
    } finally {
      setUnlockLoading(false);
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">View Capsule</h2>
        <p className="text-sm text-slate-400">Slug: {slug}</p>
      </div>

      {loading ? (
        <div className="h-32 animate-pulse rounded-md bg-slate-900/60" />
      ) : destroyed ? (
        <CapsuleViewer destroyed content="" />
      ) : (
        <div className="space-y-6">
          {locked && unlockAt && (
            <div className="space-y-3 rounded-lg border border-slate-700 bg-slate-950/40 p-4">
              <p className="text-sm text-slate-300">
                This capsule is locked until
                <span className="ml-1 font-medium text-sky-400">{new Date(unlockAt).toLocaleString()}</span>
              </p>
              <CountdownTimer unlockAt={unlockAt} />
            </div>
          )}

          {!locked && passwordRequired && (
            <form onSubmit={handleUnlock} className="space-y-3 rounded-lg border border-slate-700 bg-slate-950/40 p-4 text-sm">
              <p className="text-slate-300">This capsule is password-protected.</p>
              <input
                type="password"
                className="w-full rounded-md border border-slate-800 bg-slate-950/40 p-2 text-sm outline-none ring-sky-500/60 focus:ring"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="submit"
                disabled={unlockLoading}
                className="inline-flex items-center justify-center rounded-md bg-sky-500 px-4 py-2 text-xs font-medium text-slate-950 shadow-sm shadow-sky-500/40 transition hover:bg-sky-400 disabled:cursor-wait disabled:opacity-60"
              >
                {unlockLoading ? 'Unlocking…' : 'Unlock'}
              </button>
            </form>
          )}

          {!locked && !passwordRequired && !destroyed && (
            <CapsuleViewer content={content} mediaUrl={mediaUrl} />
          )}
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}
    </section>
  );
};

export default ViewCapsule;
