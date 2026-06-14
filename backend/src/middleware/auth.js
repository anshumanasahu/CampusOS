import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import AppError from '../utils/app-error.js';
import env from '../config/env.js';

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, env.sessionSecret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new AppError('Token has expired', 401, 'UNAUTHORIZED');
      }
      throw new AppError('Invalid token', 401, 'UNAUTHORIZED');
    }

    const user = await User.findById(decoded.userId).select('-__v');
    if (!user) {
      throw new AppError('User no longer exists', 401, 'UNAUTHORIZED');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export default authMiddleware;
