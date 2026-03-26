import { useState } from 'react';

const CapsuleForm = ({ onSubmit, loading }) => {
  const [content, setContent] = useState('');
  const [unlockAt, setUnlockAt] = useState('');
  const [selfDestruct, setSelfDestruct] = useState(false);
  const [password, setPassword] = useState('');
  const [notifyEmail, setNotifyEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ content, unlockAt, selfDestruct, password: password || undefined, notifyEmail: notifyEmail || undefined });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm text-slate-300">Message</label>
        <textarea
          className="h-40 w-full rounded-md border border-slate-800 bg-slate-950/40 p-3 text-sm outline-none ring-sky-500/60 focus:ring"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-slate-300">Unlock at</label>
        <input
          type="datetime-local"
          className="w-full rounded-md border border-slate-800 bg-slate-950/40 p-2 text-sm outline-none ring-sky-500/60 focus:ring"
          value={unlockAt}
          onChange={(e) => setUnlockAt(e.target.value)}
          required
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-slate-300">Password (optional)</label>
          <input
            type="password"
            className="w-full rounded-md border border-slate-800 bg-slate-950/40 p-2 text-sm outline-none ring-sky-500/60 focus:ring"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-300">Notify email (optional)</label>
          <input
            type="email"
            className="w-full rounded-md border border-slate-800 bg-slate-950/40 p-2 text-sm outline-none ring-sky-500/60 focus:ring"
            value={notifyEmail}
            onChange={(e) => setNotifyEmail(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <input
          id="selfDestruct"
          type="checkbox"
          className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-sky-500"
          checked={selfDestruct}
          onChange={(e) => setSelfDestruct(e.target.checked)}
        />
        <label htmlFor="selfDestruct" className="text-slate-300">
          Self-destruct after first view
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 shadow-sm shadow-sky-500/40 transition hover:bg-sky-400 disabled:cursor-wait disabled:opacity-60"
      >
        {loading ? 'Creating…' : 'Create Capsule'}
      </button>
    </form>
  );
};

export default CapsuleForm;
