import KnowledgeResource from '../models/knowledge-resource.js';
import GoodSeniorPoints from '../models/good-senior-points.js';
import AppError from '../utils/app-error.js';
import { validateRequired, validateEnum, validateObjectId } from '../utils/validators.js';

const VALID_TYPES = ['notes', 'pyq', 'professor_review'];

const POINTS_MAP = {
  notes: 10,
  pyq: 15,
  professor_review: 5,
};

/**
 * Get all resources with optional filters.
 * Knowledge Hub is shared-read: all users can see all resources.
 */
export const getResources = async (userId, filters = {}) => {
  const query = {};

  if (filters.type) {
    validateEnum(filters.type, VALID_TYPES, 'type');
    query.type = filters.type;
  }

  if (filters.subject) {
    query.subject = { $regex: filters.subject, $options: 'i' };
  }

  if (filters.search) {
    query.$text = { $search: filters.search };
  }

  const resources = await KnowledgeResource.find(query)
    .populate('userId', 'name avatar')
    .sort({ createdAt: -1 })
    .lean();

  return { resources };
};

/**
 * Get a single resource by ID.
 */
export const getResourceById = async (resourceId) => {
  validateObjectId(resourceId, 'resourceId');

  const resource = await KnowledgeResource.findById(resourceId)
    .populate('userId', 'name avatar')
    .lean();

  if (!resource) {
    throw new AppError('Resource not found', 404, 'NOT_FOUND');
  }

  return { resource };
};

/**
 * Upload a new resource (Notes or PYQ).
 * Awards Good Senior Points.
 */
export const uploadResource = async (userId, data) => {
  validateRequired(data, ['type', 'title']);
  validateEnum(data.type, VALID_TYPES, 'type');

  const resource = await KnowledgeResource.create({
    userId,
    type: data.type,
    title: data.title,
    subject: data.subject || null,
    description: data.description || null,
    fileKey: data.fileUrl || null,
    content: data.content || null,
    rating: null,
  });

  // Award points
  const pointsEarned = await awardPoints(userId, resource._id, data.type);

  return { resource, pointsEarned };
};

/**
 * Create a professor review.
 * Awards Good Senior Points.
 */
export const createProfessorReview = async (userId, data) => {
  validateRequired(data, ['professorName', 'subject', 'review']);

  const resource = await KnowledgeResource.create({
    userId,
    type: 'professor_review',
    title: data.professorName,
    subject: data.subject,
    description: data.review,
    content: data.review,
    rating: data.rating || null,
    fileKey: null,
  });

  // Award points
  const pointsEarned = await awardPoints(userId, resource._id, 'professor_review');

  return { resource, pointsEarned };
};

/**
 * Update a resource. Only owner can edit.
 */
export const updateResource = async (userId, resourceId, data) => {
  validateObjectId(resourceId, 'resourceId');

  const resource = await KnowledgeResource.findOne({ _id: resourceId, userId });
  if (!resource) {
    throw new AppError('Resource not found or you are not the owner', 404, 'NOT_FOUND');
  }

  if (data.title) resource.title = data.title;
  if (data.subject !== undefined) resource.subject = data.subject;
  if (data.description !== undefined) resource.description = data.description;
  if (data.content !== undefined) resource.content = data.content;
  if (data.rating !== undefined) resource.rating = data.rating;

  await resource.save();
  return { resource };
};

/**
 * Delete a resource. Only owner can delete.
 */
export const deleteResource = async (userId, resourceId) => {
  validateObjectId(resourceId, 'resourceId');

  const resource = await KnowledgeResource.findOne({ _id: resourceId, userId });
  if (!resource) {
    throw new AppError('Resource not found or you are not the owner', 404, 'NOT_FOUND');
  }

  await KnowledgeResource.deleteOne({ _id: resourceId });

  // Note: Points are NOT revoked on deletion (contribution was made)
  return { message: 'Resource deleted' };
};

/**
 * Get Good Senior Points for user.
 */
export const getPoints = async (userId) => {
  const points = await GoodSeniorPoints.findOne({ userId }).lean();

  if (!points) {
    return { totalPoints: 0, recentContributions: [] };
  }

  // Return last 10 contributions
  const recentContributions = (points.contributions || [])
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);

  return {
    totalPoints: points.totalPoints,
    recentContributions,
  };
};

/**
 * Internal: Award Good Senior Points for a contribution.
 */
const awardPoints = async (userId, resourceId, type) => {
  const pointsEarned = POINTS_MAP[type] || 0;

  await GoodSeniorPoints.findOneAndUpdate(
    { userId },
    {
      $inc: { totalPoints: pointsEarned },
      $push: {
        contributions: {
          resourceId,
          type,
          pointsEarned,
          date: new Date(),
        },
      },
    },
    { upsert: true, new: true }
  );

  return pointsEarned;
};
