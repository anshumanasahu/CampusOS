import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/user.js';
import AppError from '../utils/app-error.js';
import env from '../config/env.js';

const googleClient = new OAuth2Client(env.googleClientId);

/**
 * Generate JWT token for a user.
 */
const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, email: user.email, isDemo: user.isDemo },
    env.sessionSecret,
    { expiresIn: '24h' }
  );
};

/**
 * Authenticate via Google OAuth credential.
 * Verifies the ID token, finds or creates user.
 */
export const googleLogin = async (credential) => {
  if (!credential) {
    throw new AppError('Google credential is required', 400, 'VALIDATION_ERROR');
  }

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: env.googleClientId,
    });
    payload = ticket.getPayload();
  } catch (error) {
    throw new AppError('Invalid Google credential', 401, 'UNAUTHORIZED');
  }

  let user = await User.findOne({ googleId: payload.sub });

  if (!user) {
    // Check if email exists (demo account upgrade scenario)
    user = await User.findOne({ email: payload.email });
    if (user) {
      user.googleId = payload.sub;
      user.name = payload.name || user.name;
      user.avatar = payload.picture || user.avatar;
      user.isDemo = false;
      await user.save();
    } else {
      user = await User.create({
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        avatar: payload.picture,
        isDemo: false,
      });
    }
  }

  const token = generateToken(user);
  return { user, token };
};

/**
 * Demo login — load the seeded demo account.
 * Demo account must always work (per AI Dev Rules).
 */
export const demoLogin = async () => {
  let user = await User.findOne({ email: 'demo@campusos.app' });

  if (!user) {
    // Create minimal demo user if seed hasn't run
    user = await User.create({
      email: 'demo@campusos.app',
      name: 'Demo Student',
      isDemo: true,
    });
  }

  const token = generateToken(user);
  return { user, token };
};

/**
 * Get current authenticated user.
 */
export const getMe = async (userId) => {
  const user = await User.findById(userId).select('-__v');
  if (!user) {
    throw new AppError('User not found', 404, 'NOT_FOUND');
  }
  return user;
};
