import bcrypt from 'bcryptjs';
import Capsule from '../models/Capsule.js';
import { encrypt, decrypt } from '../utils/encryption.js';
import { generateSlug } from '../utils/generateToken.js';
import { createCapsuleSchema } from '../validators/capsuleValidator.js';
import { scheduleUnlockEmail, scheduleSelfDestruct } from '../jobs/capsuleJobs.js';

const SALT_ROUNDS = 12;

export const createCapsule = async (req, res, next) => {
  try {
    const { error, value } = createCapsuleSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { content, unlockAt, selfDestruct, password, notifyEmail, allowedEmails, expiresAt } = value;

    const { encryptedData, iv } = encrypt(content);

    const slug = generateSlug();

    const capsuleData = {
      slug,
      encryptedContent: encryptedData,
      iv,
      unlockAt,
      selfDestruct: !!selfDestruct,
      notifyEmail,
      allowedEmails,
      createdBy: req.user?.id || null,
      isPasswordProtected: !!password
    };

    if (password) {
      capsuleData.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    }

    if (expiresAt) {
      capsuleData.expiresAt = expiresAt;
    }

    const capsule = await Capsule.create(capsuleData);

    if (notifyEmail) {
      await scheduleUnlockEmail(capsule);
    }

    const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const url = `${baseUrl}/capsule/${slug}`;

    res.status(201).json({ slug, url });
  } catch (err) {
    next(err);
  }
};

export const getCapsule = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const capsule = await Capsule.findOne({ slug });
    if (!capsule) {
      return res.status(404).json({ message: 'Capsule not found' });
    }

    const now = new Date();
    if (now < capsule.unlockAt) {
      return res.json({
        locked: true,
        unlockAt: capsule.unlockAt
      });
    }

    if (capsule.selfDestruct && capsule.viewedAt) {
      return res.status(410).json({ message: 'This capsule has been destroyed' });
    }

    if (capsule.isPasswordProtected) {
      return res.json({ locked: false, passwordRequired: true });
    }

    const decrypted = decrypt(capsule.encryptedContent, capsule.iv);

    capsule.views += 1;
    if (!capsule.viewedAt) {
      capsule.viewedAt = now;
      if (capsule.selfDestruct) {
        await scheduleSelfDestruct(capsule);
      }
    }
    await capsule.save();

    res.json({
      locked: false,
      passwordRequired: false,
      content: decrypted,
      mediaUrl: capsule.mediaUrl,
      selfDestruct: capsule.selfDestruct
    });
  } catch (err) {
    next(err);
  }
};

export const unlockCapsuleWithPassword = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { password } = req.body;

    const capsule = await Capsule.findOne({ slug });
    if (!capsule) {
      return res.status(404).json({ message: 'Capsule not found' });
    }

    const now = new Date();
    if (now < capsule.unlockAt) {
      return res.status(403).json({ message: 'Capsule is still locked' });
    }

    if (!capsule.isPasswordProtected || !capsule.passwordHash) {
      return res.status(400).json({ message: 'Capsule is not password protected' });
    }

    const valid = await bcrypt.compare(password, capsule.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    if (capsule.selfDestruct && capsule.viewedAt) {
      return res.status(410).json({ message: 'This capsule has been destroyed' });
    }

    const decrypted = decrypt(capsule.encryptedContent, capsule.iv);

    capsule.views += 1;
    if (!capsule.viewedAt) {
      capsule.viewedAt = now;
      if (capsule.selfDestruct) {
        await scheduleSelfDestruct(capsule);
      }
    }
    await capsule.save();

    res.json({
      locked: false,
      passwordRequired: false,
      content: decrypted,
      mediaUrl: capsule.mediaUrl,
      selfDestruct: capsule.selfDestruct
    });
  } catch (err) {
    next(err);
  }
};

export const getMyCapsules = async (req, res, next) => {
  try {
    const capsules = await Capsule.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    res.json(capsules);
  } catch (err) {
    next(err);
  }
};

export const deleteCapsule = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const capsule = await Capsule.findOne({ slug });
    if (!capsule) {
      return res.status(404).json({ message: 'Capsule not found' });
    }

    if (!capsule.createdBy || capsule.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this capsule' });
    }

    await capsule.deleteOne();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
