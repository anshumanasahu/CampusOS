import asyncHandler from '../utils/async-handler.js';
import { sendSuccess, sendCreated } from '../utils/response.js';
import * as documentService from '../services/document.service.js';

export const getDocuments = asyncHandler(async (req, res) => {
  const data = await documentService.getDocuments(req.user._id, req.query);
  sendSuccess(res, data);
});

export const getDocumentById = asyncHandler(async (req, res) => {
  const data = await documentService.getDocumentById(req.user._id, req.params.id);
  sendSuccess(res, data);
});

export const uploadDocument = asyncHandler(async (req, res) => {
  const data = await documentService.uploadDocument(req.user._id, req.file);
  sendSuccess(res, data);
});

export const confirmDocument = asyncHandler(async (req, res) => {
  const data = await documentService.confirmDocument(req.user._id, req.params.id, req.body);
  sendSuccess(res, data);
});

export const rejectDocument = asyncHandler(async (req, res) => {
  const data = await documentService.rejectDocument(req.user._id, req.params.id, req.body);
  sendSuccess(res, data);
});

export const createManualDocument = asyncHandler(async (req, res) => {
  const data = await documentService.createManualDocument(req.user._id, req.body);
  sendCreated(res, data);
});

export const deleteDocument = asyncHandler(async (req, res) => {
  const data = await documentService.deleteDocument(req.user._id, req.params.id);
  sendSuccess(res, data);
});
