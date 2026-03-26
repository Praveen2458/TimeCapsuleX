import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';

const getKey = () => {
  const key = process.env.AES_SECRET_KEY;
  if (!key) {
    throw new Error('AES_SECRET_KEY is not defined');
  }
  if (key.length !== 32) {
    throw new Error('AES_SECRET_KEY must be 32 characters long');
  }
  return Buffer.from(key);
};

export const encrypt = (text) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return {
    encryptedData: encrypted,
    iv: iv.toString('base64')
  };
};

export const decrypt = (encryptedData, iv) => {
  const ivBuffer = Buffer.from(iv, 'base64');
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), ivBuffer);
  let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};
