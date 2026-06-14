import { useState } from 'react';
import { useExpenses } from '../hooks/use-expenses.js';
import Card from '../components/shared/card.jsx';
import Button from '../components/shared/button.jsx';
import Modal from '../components/shared/modal.jsx';
import Badge from '../components/shared/badge.jsx';
import LoadingSpinner from '../components/shared/loading-spinner.jsx';
import ErrorMessage from '../components/shared/error-message.jsx';
import EmptyState from '../components/shared/empty-state.jsx';
import { formatCurrency, formatDate, formatPercentage } from '../utils/formatters.js';
import { EXPENSE_CATEGORIES, PAYMENT_MODES } from '../utils/constants.js';
import { thresholdStatus } from '../utils/budget-helpers.js';

export default function ExpensesPage() {
  const { expenses, summary, budgets, reviewData, loading, error, addExpense, uploadStatement, confirmTransactions, rejectReview, refreshExpenses } = useExpenses();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ amount: '', category: 'food', description: '', date: '', merchant: '', paymentMode: 'upi' });
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editedTransactions, setEditedTransactions] = useState([]);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addExpense({ ...form, amount: Number(form.amount) });
      setShowForm(false);
      setForm({ amount: '', category: 'food', description: '', date: '', merchant: '', paymentMode: 'upi' });
    } catch {}
    setSubmitting(false);
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadStatement(file);
      setEditedTransactions(result.transactions || []);
    } catch {}
    setUploading(false);
  };

  const handleConfirmBatch = async () => {
    await confirmTransactions(editedTransactions);
    setEditedTransactions([]);
  };

  if (loading && !reviewData) return <LoadingSpinner text="Loading expenses..." />;
  if (error && !expenses.length) return <ErrorMessage message={error} onRetry={refreshExpenses} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Expenses</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowForm(true)}>+ Manual</Button>
          <label>
            <input type="file" accept=".csv" onChange={handleUpload} className="hidden" />
            <Button variant="primary" loading={uploading} onClick={() => {}}>📎 Bank Statement</Button>
          </label>
        </div>
      </div>

      {/* Budget Summary */}
      {summary && (
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Monthly Spending</p>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(summary.spent)}</p>
            </div>
            {summary.monthlyBudget > 0 && (
              <div className="text-right">
                <p className="text-xs text-slate-500">Budget: {formatCurrency(summary.monthlyBudget)}</p>
                <Badge text={formatPercentage(summary.percentageUsed) + ' used'} variant={summary.budgetCritical ? 'danger' : summary.budgetWarning ? 'warning' : 'success'} />
              </div>
            )}
          </div>
          {/* Budget bars */}
          {budgets.length > 0 && (
            <div className="mt-4 space-y-2">
              {budgets.map((b) => {
                const catExpenses = expenses.filter((e) => e.category === b.category);
                const spent = catExpenses.reduce((s, e) => s + e.amount, 0);
                const status = thresholdStatus(spent, b.limit);
                return (
                  <div key={b._id} className="flex items-center gap-3">
                    <span className="text-xs text-slate-600 w-24 capitalize">{b.category}</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${status.color === 'red' ? 'bg-red-500' : status.color === 'orange' ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${Math.min(status.percentage, 100)}%` }} />
                    </div>
                    <span className="text-xs text-slate-500">{formatCurrency(spent)}/{formatCurrency(b.limit)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* AI Review State (Bank Statement) */}
      {reviewData && (
        <Card title="Bank Statement — Review Transactions">
          <p className="text-xs text-slate-500 mb-3">AI categorized {editedTransactions.length} transactions. Edit categories before confirming.</p>
          <div className="max-h-64 overflow-y-auto space-y-2 mb-4">
            {editedTransactions.map((tx, i) => (
              <div key={i} className="flex items-center gap-2 text-sm border-b border-slate-50 py-2">
                <span className="text-slate-500 w-20">{tx.date}</span>
                <span className="flex-1 truncate text-slate-700">{tx.description}</span>
                <span className="font-medium">{formatCurrency(tx.amount)}</span>
                <select value={tx.suggestedCategory} onChange={(e) => { const updated = [...editedTransactions]; updated[i] = { ...tx, suggestedCategory: e.target.value }; setEditedTransactions(updated); }} className="text-xs border rounded px-1 py-0.5">
                  {EXPENSE_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="primary" onClick={handleConfirmBatch}>Confirm All</Button>
            <Button variant="danger" onClick={rejectReview}>Reject</Button>
          </div>
        </Card>
      )}

      {/* Expense List */}
      {expenses.length === 0 && !reviewData ? (
        <EmptyState title="No expenses yet" description="Add your first expense or upload a bank statement." actionLabel="Add Expense" onAction={() => setShowForm(true)} />
      ) : (
        <Card title="Recent Expenses">
          <div className="space-y-2">
            {expenses.slice(0, 20).map((e) => (
              <div key={e._id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-800">{e.description}</p>
                  <p className="text-xs text-slate-500">{formatDate(e.date)} • {e.category}</p>
                </div>
                <span className="font-semibold text-slate-800">{formatCurrency(e.amount)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Add Expense Modal */}
      <Modal isOpen={showForm} title="Add Expense" onClose={() => setShowForm(false)}>
        <form onSubmit={handleAddExpense} className="space-y-3">
          <input type="number" placeholder="Amount *" required min="1" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          <input type="text" placeholder="Description *" required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          <input type="text" placeholder="Merchant" value={form.merchant} onChange={(e) => setForm({ ...form, merchant: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          <input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
            {EXPENSE_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <select value={form.paymentMode} onChange={(e) => setForm({ ...form, paymentMode: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
            {PAYMENT_MODES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
          <Button type="submit" variant="primary" loading={submitting} className="w-full">Save Expense</Button>
        </form>
      </Modal>
    </div>
  );
}
