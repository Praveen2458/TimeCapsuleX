import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/db.js';
// Import jobs module so BullMQ workers start on boot
import './jobs/capsuleJobs.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
})();
