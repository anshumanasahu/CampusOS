import { useState, useCallback, useEffect } from 'react';
import { documentService } from '../services/document-service.js';

export function useDocuments() {
  const [documents, setDocuments] = useState([]);
  const [reviewData, setReviewData] = useState(null); // AI extraction review state
  const [currentDocument, setCurrentDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshDocuments = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const res = await documentService.getDocuments(params);
      setDocuments(res.data.documents || []);
    } catch (err) {
      setError(err.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, []);

  const getDocument = useCallback(async (id) => {
    setError(null);
    try {
      const res = await documentService.getDocument(id);
      setCurrentDocument(res.data.document);
      return res.data.document;
    } catch (err) {
      setError(err.message || 'Failed to load document');
      throw err;
    }
  }, []);

  // Upload → returns REVIEW state (never auto-saves)
  const uploadDocument = useCallback(async (file) => {
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await documentService.upload(formData);
      setReviewData(res.data);
      return res.data;
    } catch (err) {
      setError(err.message || 'Failed to upload document');
      throw err;
    }
  }, []);

  // Confirm extraction after user review/edit
  const confirmDocument = useCallback(async (documentId, data) => {
    setError(null);
    try {
      const res = await documentService.confirm(documentId, data);
      setReviewData(null);
      await refreshDocuments();
      return res.data;
    } catch (err) {
      setError(err.message || 'Failed to confirm document');
      throw err;
    }
  }, [refreshDocuments]);

  // Reject extraction (discard AI output)
  const rejectDocument = useCallback(async (documentId, options) => {
    setError(null);
    try {
      await documentService.reject(documentId, options);
      setReviewData(null);
      await refreshDocuments();
    } catch (err) {
      setError(err.message || 'Failed to reject document');
      throw err;
    }
  }, [refreshDocuments]);

  // Manual fallback entry
  const createManual = useCallback(async (data) => {
    setError(null);
    try {
      await documentService.createManual(data);
      await refreshDocuments();
    } catch (err) {
      setError(err.message || 'Failed to create manual entry');
      throw err;
    }
  }, [refreshDocuments]);

  const deleteDocument = useCallback(async (id) => {
    setError(null);
    try {
      await documentService.deleteDocument(id);
      await refreshDocuments();
    } catch (err) {
      setError(err.message || 'Failed to delete document');
      throw err;
    }
  }, [refreshDocuments]);

  // Clear review state (e.g., on cancel)
  const clearReview = useCallback(() => {
    setReviewData(null);
  }, []);

  useEffect(() => {
    refreshDocuments();
  }, [refreshDocuments]);

  return {
    documents,
    reviewData,
    currentDocument,
    loading,
    error,
    uploadDocument,
    confirmDocument,
    rejectDocument,
    createManual,
    deleteDocument,
    getDocument,
    clearReview,
    refreshDocuments,
  };
}
