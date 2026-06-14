import { useState, useCallback, useEffect } from 'react';
import { knowledgeService } from '../services/knowledge-service.js';

export function useKnowledge() {
  const [resources, setResources] = useState([]);
  const [points, setPoints] = useState({ totalPoints: 0, recentContributions: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshKnowledge = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const res = await knowledgeService.getResources(params);
      setResources(res.data.resources || []);
    } catch (err) {
      setError(err.message || 'Failed to load resources');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshPoints = useCallback(async () => {
    try {
      const res = await knowledgeService.getPoints();
      setPoints(res.data);
    } catch (err) {
      // Non-critical
    }
  }, []);

  const uploadResource = useCallback(async (data) => {
    setError(null);
    try {
      const res = await knowledgeService.upload(data);
      await refreshKnowledge();
      await refreshPoints();
      return res.data;
    } catch (err) {
      setError(err.message || 'Failed to upload resource');
      throw err;
    }
  }, [refreshKnowledge, refreshPoints]);

  const submitProfessorReview = useCallback(async (data) => {
    setError(null);
    try {
      const res = await knowledgeService.createProfessorReview(data);
      await refreshKnowledge();
      await refreshPoints();
      return res.data;
    } catch (err) {
      setError(err.message || 'Failed to submit review');
      throw err;
    }
  }, [refreshKnowledge, refreshPoints]);

  const updateResource = useCallback(async (id, data) => {
    setError(null);
    try {
      await knowledgeService.updateResource(id, data);
      await refreshKnowledge();
    } catch (err) {
      setError(err.message || 'Failed to update resource');
      throw err;
    }
  }, [refreshKnowledge]);

  const deleteResource = useCallback(async (id) => {
    setError(null);
    try {
      await knowledgeService.deleteResource(id);
      await refreshKnowledge();
    } catch (err) {
      setError(err.message || 'Failed to delete resource');
      throw err;
    }
  }, [refreshKnowledge]);

  useEffect(() => {
    refreshKnowledge();
    refreshPoints();
  }, [refreshKnowledge, refreshPoints]);

  return {
    resources,
    points,
    loading,
    error,
    uploadResource,
    submitProfessorReview,
    updateResource,
    deleteResource,
    refreshKnowledge,
    refreshPoints,
  };
}
