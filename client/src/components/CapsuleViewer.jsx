import { motion } from 'framer-motion';

const CapsuleViewer = ({ content, mediaUrl, destroyed }) => {
  if (destroyed) {
    return (
      <div className="rounded-lg border border-red-500/60 bg-red-950/40 p-4 text-sm text-red-100">
        This capsule has been destroyed.
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 rounded-lg border border-emerald-500/50 bg-slate-950/40 p-4"
    >
      {mediaUrl && (
        <div>
          <img src={mediaUrl} alt="Capsule media" className="max-h-64 w-full rounded-md object-cover" />
        </div>
      )}
      <p className="whitespace-pre-wrap text-sm text-slate-50">{content}</p>
    </motion.div>
  );
};

export default CapsuleViewer;
