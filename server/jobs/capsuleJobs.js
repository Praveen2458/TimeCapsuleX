import { Queue, Worker } from 'bullmq';
import dotenv from 'dotenv';
import { getRedisClient } from '../config/redis.js';
import Capsule from '../models/Capsule.js';
import { sendEmail } from '../utils/sendEmail.js';

dotenv.config();

// Catch Redis / BullMQ connection errors that surface as unhandled rejections
// when the Upstash host is not reachable (e.g. local dev without internet).
process.on('unhandledRejection', (err) => {
  if (err && (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED' || err.code === 'ECONNRESET')) {
    // Silently swallow — Redis unreachable in local dev, jobs are disabled.
    return;
  }
  // Re-throw all other unhandled rejections so real bugs still crash the process.
  throw err;
});

// A no-op error handler so 'error' events on Workers / Queues don't crash.
const silenceErrors = (emitter) => {
  emitter.on('error', () => {});
  return emitter;
};

let connection = null;
try {
  connection = getRedisClient();
} catch (err) {
  console.warn('Redis not configured or failed to connect; background jobs disabled.', err.message);
}

export const unlockNotifierQueue = connection
  ? silenceErrors(new Queue('unlock-notifier', { connection }))
  : null;
export const selfDestructQueue = connection
  ? silenceErrors(new Queue('self-destruct', { connection }))
  : null;
export const cleanupQueue = connection
  ? silenceErrors(new Queue('cleanup', { connection }))
  : null;

export const scheduleUnlockEmail = async (capsule) => {
  if (!unlockNotifierQueue) return;
  if (!capsule.notifyEmail) return;
  const delay = Math.max(0, capsule.unlockAt.getTime() - Date.now());
  await unlockNotifierQueue.add(
    'send-unlock-email',
    { capsuleId: capsule._id, notifyEmail: capsule.notifyEmail, slug: capsule.slug },
    { delay }
  );
};

export const scheduleSelfDestruct = async (capsule) => {
  if (!selfDestructQueue) return;
  await selfDestructQueue.add(
    'delete-capsule',
    { capsuleId: capsule._id },
    { delay: 60 * 1000 }
  );
};

// Workers — only started when Redis is available
if (connection) {
  const unlockNotifierWorker = silenceErrors(new Worker(
    'unlock-notifier',
    async (job) => {
      const { capsuleId, notifyEmail, slug } = job.data;
      const capsule = await Capsule.findById(capsuleId);
      if (!capsule) return;

      const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      const url = `${baseUrl}/capsule/${slug}`;

      await sendEmail({
        to: notifyEmail,
        subject: 'Your TimeCapsuleX capsule is unlocked',
        html: `<p>Your capsule is now available: <a href="${url}">${url}</a></p>`
      });
    },
    {
      connection,
      stalledInterval: 86_400_000, // 24h — minimises reconnects when Redis is unreachable locally
    }
  ));

  unlockNotifierWorker.on('completed', (job) => {
    console.log(`Unlock email job completed for capsule ${job.data?.capsuleId}`);
  });

  unlockNotifierWorker.on('failed', (job, err) => {
    console.error(
      `Unlock email job failed for capsule ${job?.data?.capsuleId}: ${err?.message || err}`
    );
  });

  silenceErrors(new Worker(
    'self-destruct',
    async (job) => {
      const { capsuleId } = job.data;
      await Capsule.findByIdAndDelete(capsuleId);
    },
    { connection, stalledInterval: 86_400_000 }
  ));

  silenceErrors(new Worker(
    'cleanup',
    async () => {
      const now = new Date();
      await Capsule.deleteMany({ expiresAt: { $lt: now } });
    },
    { connection, stalledInterval: 86_400_000 }
  ));

  // Schedule daily cleanup job
  (async () => {
    try {
      await cleanupQueue.add(
        'daily-cleanup',
        {},
        { repeat: { cron: '0 0 * * *' } } // every midnight
      );
    } catch (err) {
      console.warn('Could not schedule daily cleanup job:', err.message);
    }
  })();
}
