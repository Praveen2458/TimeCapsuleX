import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
} from '../utils/generateToken.js';

const SALT_ROUNDS = 12;

export const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({ email, password: hashed });

    const accessToken = generateAccessToken({ id: user._id, email: user.email });
    const refreshToken = generateRefreshToken({ id: user._id, email: user.email });

    res.status(201).json({
      user: { id: user._id, email: user.email },
      accessToken,
      refreshToken
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const accessToken = generateAccessToken({ id: user._id, email: user.email });
    const refreshToken = generateRefreshToken({ id: user._id, email: user.email });

    res.json({
      user: { id: user._id, email: user.email },
      accessToken,
      refreshToken
    });
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: 'refreshToken is required' });
    }

    const decoded = verifyRefreshToken(refreshToken);
    const accessToken = generateAccessToken({ id: decoded.id, email: decoded.email });

    res.json({ accessToken });
  } catch (err) {
    err.status = 401;
    next(err);
  }
};
