import mongoose from 'mongoose';

const capsuleSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    encryptedContent: {
      type: String,
      required: true
    },
    iv: {
      type: String,
      required: true
    },
    mediaUrl: {
      type: String
    },
    unlockAt: {
      type: Date,
      required: true
    },
    isUnlocked: {
      type: Boolean,
      default: false
    },
    selfDestruct: {
      type: Boolean,
      default: false
    },
    viewedAt: {
      type: Date
    },
    isPasswordProtected: {
      type: Boolean,
      default: false
    },
    passwordHash: {
      type: String
    },
    notifyEmail: {
      type: String
    },
    allowedEmails: [{ type: String }],
    views: {
      type: Number,
      default: 0
    },
    expiresAt: {
      type: Date,
      index: { expires: 0 }
    }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const Capsule = mongoose.model('Capsule', capsuleSchema);

export default Capsule;
