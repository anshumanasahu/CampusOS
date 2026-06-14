import { useState } from 'react';
import { useDocuments } from '../hooks/use-documents.js';
import Card from '../components/shared/card.jsx';
import Button from '../components/shared/button.jsx';
import StatusTag from '../components/shared/status-tag.jsx';
import LoadingSpinner from '../components/shared/loading-spinner.jsx';
import ErrorMessage from '../components/shared/error-message.jsx';
import EmptyState from '../components/shared/empty-state.jsx';
import ConfirmDialog from '../components/shared/confirm-dialog.jsx';
import { formatDate } from '../utils/formatters.js';
import { DOCUMENT_CATEGORIES } from '../utils/constants.js';

export default function DocumentsPage() {
  const { documents, reviewData, loading, error, uploadDocument, confirmDocument, rejectDocument, createManual, deleteDocument, clearReview, refreshDocuments } = useDocuments();
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualData, setManualData] = useState({ title: '', category: 'other', date: '', subject: '', description: '' });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [editedData, setEditedData] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadDocument(file);
    } catch {}
    setUploading(false);
  };

  const handleConfirm = async () => {
    if (!reviewData?.document?._id) return;
    await confirmDocument(reviewData.document._id, {
      category: selectedCategory || reviewData.suggestedCategory,
      confirmedData: editedData || reviewData.extractedData,
    });
  };

  const handleReject = async () => {
    if (!reviewData?.document?._id) return;
    await rejectDocument(reviewData.document._id);
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    await createManual(manualData);
    setShowManualForm(false);
    setManualData({ title: '', category: 'other', date: '', subject: '', description: '' });
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    await deleteDocument(confirmDelete);
    setConfirmDelete(null);
  };

  if (loading && !reviewData) return <LoadingSpinner text="Loading documents..." />;
  if (error && !documents.length) return <ErrorMessage message={error} onRetry={refreshDocuments} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Upload Documents</h1>
        <Button variant="secondary" onClick={() => setShowManualForm(!showManualForm)}>
          {showManualForm ? 'Cancel' : '+ Manual Entry'}
        </Button>
      </div>

      {/* File Upload */}
      {!reviewData && (
        <Card>
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-indigo-300 transition-colors">
            <p className="text-slate-600 mb-2">Drag & drop or click to upload</p>
            <p className="text-xs text-slate-400 mb-4">PDF, DOCX only. Max 20MB.</p>
            <input type="file" accept=".pdf,.docx" onChange={handleFileUpload} className="hidden" id="file-upload" />
            <label htmlFor="file-upload">
              <Button variant="primary" loading={uploading} className="cursor-pointer" onClick={() => document.getElementById('file-upload').click()}>
                {uploading ? 'Uploading...' : 'Choose File'}
              </Button>
            </label>
          </div>
        </Card>
      )}

      {/* AI Review State */}
      {reviewData && (
        <Card title="AI Extraction — Review Required">
          <div className="space-y-4">
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
              <p className="text-sm font-medium text-indigo-800 mb-2">Extracted Data</p>
              {reviewData.extractedData ? (
                <pre className="text-xs text-slate-700 whitespace-pre-wrap bg-white rounded p-3 max-h-48 overflow-y-auto">
                  {JSON.stringify(reviewData.extractedData, null, 2)}
                </pre>
              ) : (
                <p className="text-sm text-slate-500">No data extracted. Use manual entry.</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select
                value={selectedCategory || reviewData.suggestedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                <option value="">Select category</option>
                {DOCUMENT_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <Button variant="primary" onClick={handleConfirm}>Confirm & Save</Button>
              <Button variant="danger" onClick={handleReject}>Reject</Button>
              <Button variant="secondary" onClick={clearReview}>Cancel</Button>
            </div>
            <p className="text-xs text-slate-400">AI never saves automatically. Review and confirm.</p>
          </div>
        </Card>
      )}

      {/* Manual Form */}
      {showManualForm && (
        <Card title="Manual Document Entry">
          <form onSubmit={handleManualSubmit} className="space-y-3">
            <input type="text" placeholder="Title *" required value={manualData.title} onChange={(e) => setManualData({ ...manualData, title: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            <select value={manualData.category} onChange={(e) => setManualData({ ...manualData, category: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
              {DOCUMENT_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <input type="date" value={manualData.date} onChange={(e) => setManualData({ ...manualData, date: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            <input type="text" placeholder="Subject" value={manualData.subject} onChange={(e) => setManualData({ ...manualData, subject: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            <textarea placeholder="Description" value={manualData.description} onChange={(e) => setManualData({ ...manualData, description: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" rows={3} />
            <Button type="submit" variant="primary">Save Manual Entry</Button>
          </form>
        </Card>
      )}

      {/* Upload History */}
      {documents.length === 0 && !reviewData && !showManualForm ? (
        <EmptyState title="No documents yet" description="Upload a PDF or DOCX to extract information with AI." actionLabel="Upload Document" onAction={() => document.getElementById('file-upload')?.click()} />
      ) : (
        <Card title="Upload History">
          <div className="space-y-2">
            {documents.map((doc) => (
              <div key={doc._id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{doc.fileName}</p>
                  <p className="text-xs text-slate-500">{formatDate(doc.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusTag status={doc.status} />
                  <button onClick={() => setConfirmDelete(doc._id)} className="text-slate-400 hover:text-red-500 text-xs">✕</button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <ConfirmDialog isOpen={!!confirmDelete} title="Delete Document" message="This will permanently delete the document and its file." onConfirm={handleDelete} onCancel={() => setConfirmDelete(null)} />
    </div>
  );
}
