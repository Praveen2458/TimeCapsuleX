import request from 'supertest';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from '../app.js';
import connectDB from '../config/db.js';
import Capsule from '../models/Capsule.js';

dotenv.config({ path: '.env.test' });

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await mongoose.connection.close();
});

afterEach(async () => {
  await Capsule.deleteMany({});
});

describe('Capsule API', () => {
  test('POST /api/v1/capsules creates capsule and returns slug', async () => {
    const unlockAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    const res = await request(app)
      .post('/api/v1/capsules')
      .send({
        content: 'Hello future',
        unlockAt
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.slug).toBeDefined();
  });

  test('GET /api/v1/capsules/:slug when locked returns locked true', async () => {
    const unlockAt = new Date(Date.now() + 60 * 60 * 1000);

    const capsule = await Capsule.create({
      slug: 'testslug',
      encryptedContent: 'dummy',
      iv: 'dummyiv',
      unlockAt
    });

    const res = await request(app).get(`/api/v1/capsules/${capsule.slug}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.locked).toBe(true);
  });
});
