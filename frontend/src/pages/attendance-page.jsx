import { useState, useEffect } from 'react';
import { useAttendance } from '../hooks/use-attendance.js';
import Card from '../components/shared/card.jsx';
import Button from '../components/shared/button.jsx';
import Modal from '../components/shared/modal.jsx';
import StatusTag from '../components/shared/status-tag.jsx';
import LoadingSpinner from '../components/shared/loading-spinner.jsx';
import ErrorMessage from '../components/shared/error-message.jsx';
import EmptyState from '../components/shared/empty-state.jsx';
import { formatDate, formatPercentage } from '../utils/formatters.js';
import { ATTENDANCE_STATUSES, DAYS_OF_WEEK } from '../utils/constants.js';

export default function AttendancePage() {
  const { subjects, records, report, loading, error, addSubject, markAttendance, markDay, refreshAttendance, refreshReport, deleteSubject } = useAttendance();
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', faculty: '', day: 'monday', startTime: '09:00', endTime: '10:00', room: '', targetThreshold: 75 });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { refreshReport(); }, [refreshReport]);

  const handleAddSubject = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addSubject({ ...form, schedule: [{ day: form.day, startTime: form.startTime, endTime: form.endTime, room: form.room }] });
      setShowAddForm(false);
      setForm({ name: '', code: '', faculty: '', day: 'monday', startTime: '09:00', endTime: '10:00', room: '', targetThreshold: 75 });
      refreshReport();
    } catch {}
    setSubmitting(false);
  };

  const handleMark = async (subjectId, status) => {
    await markAttendance({ subjectId, status });
    refreshReport();
  };

  if (loading) return <LoadingSpinner text="Loading attendance..." />;
  if (error && !subjects.length) return <ErrorMessage message={error} onRetry={refreshAttendance} />;

  // Unique subject names from timetable
  const uniqueSubjects = [...new Map(subjects.map((s) => [s.name, s])).values()];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Attendance</h1>
        <Button onClick={() => setShowAddForm(true)}>+ Add Subject</Button>
      </div>

      {/* Report Summary */}
      {report?.overall && (
        <Card>
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs text-slate-500">Overall</p>
              <p className="text-3xl font-bold text-indigo-600">{formatPercentage(report.overall.percentage)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Classes</p>
              <p className="text-lg font-semibold text-slate-800">{report.overall.attended}/{report.overall.total}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Per-subject cards */}
      {uniqueSubjects.length === 0 ? (
        <EmptyState title="No subjects yet" description="Add your first subject to start tracking attendance." actionLabel="Add Subject" onAction={() => setShowAddForm(true)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report?.subjects?.map((subj, i) => (
            <Card key={i}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium text-slate-800">{subj.name}</p>
                  {subj.code && <p className="text-xs text-slate-500">{subj.code}</p>}
                </div>
                <p className="text-xl font-bold text-indigo-600">{formatPercentage(subj.percentage)}</p>
              </div>
              <div className="flex gap-4 text-xs text-slate-500 mb-3">
                <span>Attended: {subj.attended}</span>
                <span>Total: {subj.total}</span>
                <span>Safe skips: {subj.safeSkips}</span>
                {subj.classesNeeded > 0 && <span className="text-red-500">Need: {subj.classesNeeded}</span>}
              </div>
              {/* Mark buttons */}
              <div className="flex flex-wrap gap-2">
                {ATTENDANCE_STATUSES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => {
                      const subjectEntry = subjects.find((sub) => sub.name === subj.name);
                      if (subjectEntry) handleMark(subjectEntry._id, s.value);
                    }}
                    className="text-xs px-2 py-1 rounded border border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Subject Modal */}
      <Modal isOpen={showAddForm} title="Add Subject" onClose={() => setShowAddForm(false)}>
        <form onSubmit={handleAddSubject} className="space-y-3">
          <input type="text" placeholder="Subject Name *" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          <input type="text" placeholder="Course Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          <input type="text" placeholder="Faculty" value={form.faculty} onChange={(e) => setForm({ ...form, faculty: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          <select value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
            {DAYS_OF_WEEK.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            <input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className="px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          </div>
          <input type="text" placeholder="Room" value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          <input type="number" placeholder="Target %" min="1" max="100" value={form.targetThreshold} onChange={(e) => setForm({ ...form, targetThreshold: Number(e.target.value) })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          <Button type="submit" variant="primary" loading={submitting} className="w-full">Save Subject</Button>
        </form>
      </Modal>
    </div>
  );
}
