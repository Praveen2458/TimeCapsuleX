import { useState } from 'react';
import CapsuleForm from '../components/CapsuleForm.jsx';
import { createCapsule } from '../services/api.js';

const CreateCapsule = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      const res = await createCapsule(data);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create capsule');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Create a Capsule</h2>
        <p className="text-sm text-slate-400">Fill in the details and choose when it should unlock.</p>
      </div>

      <CapsuleForm onSubmit={handleSubmit} loading={loading} />

      {error && <p className="text-sm text-red-400">{error}</p>}

      {result && (
        <div className="rounded-md border border-emerald-500/40 bg-emerald-950/20 p-3 text-xs text-emerald-100">
          <p className="font-medium">Capsule created!</p>
          <p className="mt-1 break-all">Slug: {result.slug}</p>
          <p className="mt-1 break-all">URL: {result.url}</p>
        </div>
      )}
    </section>
  );
};

export default CreateCapsule;
