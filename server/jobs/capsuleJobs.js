import pkg from 'bullmq';
import dotenv from 'dotenv';
import { getRedisClient } from '../config/redis.js';
import Capsule from '../models/Capsule.js';
import { sendEmail } from '../utils/sendEmail.js';

dotenv.config();
const { Queue, Worker, QueueScheduler } = pkg;

let connection = null;
try {
  connection = getRedisClient();
} catch (err) {
  console.warn('Redis not configured or failed to connect; background jobs disabled.', err.message);
}

export const unlockNotifierQueue = connection
  ? new Queue('unlock-notifier', { connection })
  : null;
export const selfDestructQueue = connection
  ? new Queue('self-destruct', { connection })
  : null;
export const cleanupQueue = connection ? new Queue('cleanup', { connection }) : null;

if (connection) {
  new QueueScheduler('unlock-notifier', { connection });
  new QueueScheduler('self-destruct', { connection });
  new QueueScheduler('cleanup', { connection });
}

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

// Workers
if (connection) {
  new Worker(
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
    { connection }
  );

  new Worker(
    'self-destruct',
    async (job) => {
      const { capsuleId } = job.data;
      await Capsule.findByIdAndDelete(capsuleId);
    },
    { connection }
  );

  new Worker(
    'cleanup',
    async () => {
      const now = new Date();
      await Capsule.deleteMany({ expiresAt: { $lt: now } });
    },
    { connection }
  );

  // Schedule daily cleanup job
  (async () => {
    await cleanupQueue.add(
      'daily-cleanup',
      {},
      {
        repeat: { cron: '0 0 * * *' } // every midnight
      }
    );
  })();
}
