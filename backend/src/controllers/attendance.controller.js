import asyncHandler from '../utils/async-handler.js';
import { sendSuccess, sendCreated, sendMessage } from '../utils/response.js';
import * as attendanceService from '../services/attendance.service.js';

export const getAttendance = asyncHandler(async (req, res) => {
  const data = await attendanceService.getAttendance(req.user._id);
  sendSuccess(res, data);
});

export const createSubject = asyncHandler(async (req, res) => {
  const subjects = await attendanceService.createSubject(req.user._id, req.body);
  sendCreated(res, { subjects });
});

export const updateSubject = asyncHandler(async (req, res) => {
  const subject = await attendanceService.updateSubject(req.user._id, req.params.id, req.body);
  sendSuccess(res, { subject });
});

export const deleteSubject = asyncHandler(async (req, res) => {
  const result = await attendanceService.deleteSubject(req.user._id, req.params.id);
  sendSuccess(res, result);
});

export const markAttendance = asyncHandler(async (req, res) => {
  const result = await attendanceService.markAttendance(req.user._id, req.body);
  sendSuccess(res, result);
});

export const markDay = asyncHandler(async (req, res) => {
  const result = await attendanceService.markDay(req.user._id, req.body);
  sendSuccess(res, result);
});

export const getReport = asyncHandler(async (req, res) => {
  const report = await attendanceService.getReport(req.user._id, req.query);
  sendSuccess(res, report);
});
