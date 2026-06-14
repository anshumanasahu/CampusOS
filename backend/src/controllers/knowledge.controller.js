import asyncHandler from '../utils/async-handler.js';
import { sendSuccess, sendCreated } from '../utils/response.js';
import * as knowledgeService from '../services/knowledge.service.js';

export const getResources = asyncHandler(async (req, res) => {
  const data = await knowledgeService.getResources(req.user._id, req.query);
  sendSuccess(res, data);
});

export const getResourceById = asyncHandler(async (req, res) => {
  const data = await knowledgeService.getResourceById(req.params.id);
  sendSuccess(res, data);
});

export const uploadResource = asyncHandler(async (req, res) => {
  const data = await knowledgeService.uploadResource(req.user._id, req.body);
  sendCreated(res, data);
});

export const createProfessorReview = asyncHandler(async (req, res) => {
  const data = await knowledgeService.createProfessorReview(req.user._id, req.body);
  sendCreated(res, data);
});

export const updateResource = asyncHandler(async (req, res) => {
  const data = await knowledgeService.updateResource(req.user._id, req.params.id, req.body);
  sendSuccess(res, data);
});

export const deleteResource = asyncHandler(async (req, res) => {
  const data = await knowledgeService.deleteResource(req.user._id, req.params.id);
  sendSuccess(res, data);
});

export const getPoints = asyncHandler(async (req, res) => {
  const data = await knowledgeService.getPoints(req.user._id);
  sendSuccess(res, data);
});
