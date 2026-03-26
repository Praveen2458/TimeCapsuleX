import Joi from 'joi';

export const createCapsuleSchema = Joi.object({
  content: Joi.string().min(1).max(5000).required(),
  unlockAt: Joi.date().iso().greater('now').required(),
  selfDestruct: Joi.boolean().default(false),
  password: Joi.string().min(4).max(128).optional(),
  notifyEmail: Joi.string().email().optional(),
  allowedEmails: Joi.array().items(Joi.string().email()).optional(),
  expiresAt: Joi.date().iso().greater(Joi.ref('unlockAt')).optional()
});
