import { useState, useCallback, useEffect } from 'react';
import { attendanceService } from '../services/attendance-service.js';
import { calculateAttendanceStats } from '../utils/attendance-calculator.js';

export function useAttendance() {
  const [subjects, setSubjects] = useState([]);
  const [records, setRecords] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshAttendance = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await attendanceService.getAttendance();
      setSubjects(res.data.subjects || []);
      setRecords(res.data.records || []);
    } catch (err) {
      setError(err.message || 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshReport = useCallback(async () => {
    try {
      const res = await attendanceService.getReport();
      setReport(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load report');
    }
  }, []);

  const addSubject = useCallback(async (data) => {
    setError(null);
    try {
      await attendanceService.createSubject(data);
      await refreshAttendance();
    } catch (err) {
      setError(err.message || 'Failed to add subject');
      throw err;
    }
  }, [refreshAttendance]);

  const updateSubject = useCallback(async (id, data) => {
    setError(null);
    try {
      await attendanceService.updateSubject(id, data);
      await refreshAttendance();
    } catch (err) {
      setError(err.message || 'Failed to update subject');
      throw err;
    }
  }, [refreshAttendance]);

  const deleteSubject = useCallback(async (id) => {
    setError(null);
    try {
      await attendanceService.deleteSubject(id);
      await refreshAttendance();
    } catch (err) {
      setError(err.message || 'Failed to delete subject');
      throw err;
    }
  }, [refreshAttendance]);

  const markAttendance = useCallback(async (data) => {
    setError(null);
    try {
      const res = await attendanceService.markAttendance(data);
      await refreshAttendance();
      return res.data;
    } catch (err) {
      setError(err.message || 'Failed to mark attendance');
      throw err;
    }
  }, [refreshAttendance]);

  const markDay = useCallback(async (data) => {
    setError(null);
    try {
      await attendanceService.markDay(data);
      await refreshAttendance();
    } catch (err) {
      setError(err.message || 'Failed to mark day');
      throw err;
    }
  }, [refreshAttendance]);

  useEffect(() => {
    refreshAttendance();
  }, [refreshAttendance]);

  return {
    subjects,
    records,
    report,
    loading,
    error,
    addSubject,
    updateSubject,
    deleteSubject,
    markAttendance,
    markDay,
    refreshAttendance,
    refreshReport,
    calculateAttendanceStats,
  };
}
