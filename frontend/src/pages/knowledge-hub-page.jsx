import { useState } from 'react';
import { useKnowledge } from '../hooks/use-knowledge.js';
import Card from '../components/shared/card.jsx';
import Button from '../components/shared/button.jsx';
import Modal from '../components/shared/modal.jsx';
import Badge from '../components/shared/badge.jsx';
import LoadingSpinner from '../components/shared/loading-spinner.jsx';
import ErrorMessage from '../components/shared/error-message.jsx';
import EmptyState from '../components/shared/empty-state.jsx';
import { KNOWLEDGE_TYPES } from '../utils/constants.js';

export default function KnowledgeHubPage() {
  const { resources, points, loading, error, uploadResource, submitProfessorReview, deleteResource, refreshKnowledge } = useKnowledge();
  const [activeTab, setActiveTab] = useState('notes');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [uploadForm, setUploadForm] = useState({ type: 'notes', title: '', subject: '', description: '', content: '' });
  const [reviewForm, setReviewForm] = useState({ professorName: '', subject: '', review: '', rating: 4 });
  const [submitting, setSubmitting] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await uploadResource(uploadForm);
      setShowUploadForm(false);
      setUploadForm({ type: 'notes', title: '', subject: '', description: '', content: '' });
    } catch {}
    setSubmitting(false);
  };

  const handleReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitProfessorReview(reviewForm);
      setShowReviewForm(false);
      setReviewForm({ professorName: '', subject: '', review: '', rating: 4 });
    } catch {}
    setSubmitting(false);
  };

  const filtered = resources.filter((r) => r.type === activeTab);

  if (loading) return <LoadingSpinner text="Loading knowledge hub..." />;
  if (error && !resources.length) return <ErrorMessage message={error} onRetry={refreshKnowledge} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Knowledge Hub</h1>
        <div className="flex gap-2">
          <Button variant="primary" onClick={() => setShowUploadForm(true)}>+ Upload</Button>
          <Button variant="secondary" onClick={() => setShowReviewForm(true)}>+ Prof Review</Button>
        </div>
      </div>

      {/* Points */}
      {points.totalPoints > 0 && (
        <Card>
          <div className="flex items-center gap-3">
            <span className="text-2xl">⭐</span>
            <div>
              <p className="text-lg font-bold text-indigo-600">{points.totalPoints} Good Senior Points</p>
              <p className="text-xs text-slate-500">{points.recentContributions?.length || 0} contributions</p>
            </div>
          </div>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-white/[0.04] p-1 rounded-xl w-fit border border-transparent dark:border-white/[0.06]">
        {KNOWLEDGE_TYPES.map((t) => (
          <button key={t.value} onClick={() => setActiveTab(t.value)} className={`px-4 py-2 text-sm rounded-lg transition-all duration-150 ${activeTab === t.value ? 'bg-white dark:bg-white/[0.08] text-brand-600 dark:text-brand-300 font-medium shadow-sm dark:shadow-none' : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Resource List */}
      {filtered.length === 0 ? (
        <EmptyState title={`No ${activeTab === 'professor_review' ? 'reviews' : activeTab} yet`} description="Be the first to contribute!" actionLabel="Add Resource" onAction={() => activeTab === 'professor_review' ? setShowReviewForm(true) : setShowUploadForm(true)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((r) => (
            <Card key={r._id}>
              <div className="flex justify-between items-start mb-2">
                <p className="font-medium text-slate-800">{r.title}</p>
                <Badge text={r.type} variant="info" />
              </div>
              {r.subject && <p className="text-xs text-slate-500 mb-1">{r.subject}</p>}
              {r.description && <p className="text-sm text-slate-600 line-clamp-2">{r.description}</p>}
              {r.rating && <p className="text-xs text-amber-600 mt-1">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</p>}
              <p className="text-xs text-slate-400 mt-2">by {r.userId?.name || 'Anonymous'}</p>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Form */}
      <Modal isOpen={showUploadForm} title="Upload Resource" onClose={() => setShowUploadForm(false)}>
        <form onSubmit={handleUpload} className="space-y-3">
          <select value={uploadForm.type} onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
            <option value="notes">Notes</option>
            <option value="pyq">PYQ</option>
          </select>
          <input type="text" placeholder="Title *" required value={uploadForm.title} onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          <input type="text" placeholder="Subject" value={uploadForm.subject} onChange={(e) => setUploadForm({ ...uploadForm, subject: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          <textarea placeholder="Content / Description" value={uploadForm.content} onChange={(e) => setUploadForm({ ...uploadForm, content: e.target.value })} rows={4} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          <Button type="submit" variant="primary" loading={submitting} className="w-full">Upload (+{uploadForm.type === 'pyq' ? 15 : 10} pts)</Button>
        </form>
      </Modal>

      {/* Professor Review Form */}
      <Modal isOpen={showReviewForm} title="Professor Review" onClose={() => setShowReviewForm(false)}>
        <form onSubmit={handleReview} className="space-y-3">
          <input type="text" placeholder="Professor Name *" required value={reviewForm.professorName} onChange={(e) => setReviewForm({ ...reviewForm, professorName: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          <input type="text" placeholder="Subject *" required value={reviewForm.subject} onChange={(e) => setReviewForm({ ...reviewForm, subject: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          <textarea placeholder="Your review *" required value={reviewForm.review} onChange={(e) => setReviewForm({ ...reviewForm, review: e.target.value })} rows={4} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          <div>
            <label className="text-sm text-slate-600">Rating</label>
            <input type="range" min="1" max="5" value={reviewForm.rating} onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })} className="w-full" />
            <p className="text-xs text-slate-500 text-center">{'★'.repeat(reviewForm.rating)}{'☆'.repeat(5 - reviewForm.rating)}</p>
          </div>
          <Button type="submit" variant="primary" loading={submitting} className="w-full">Submit Review (+5 pts)</Button>
        </form>
      </Modal>
    </div>
  );
}
