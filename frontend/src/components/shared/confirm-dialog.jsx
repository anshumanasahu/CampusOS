import Modal from './modal.jsx';
import Button from './button.jsx';

export default function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel, confirmLabel = 'Confirm', danger = true }) {
  return (
    <Modal isOpen={isOpen} title={title || 'Confirm'} onClose={onCancel} size="sm">
      <p className="text-body text-slate-600 mb-6">{message || 'Are you sure?'}</p>
      <div className="flex justify-end gap-2.5">
        <Button variant="secondary" size="sm" onClick={onCancel}>Cancel</Button>
        <Button variant={danger ? 'danger' : 'primary'} size="sm" onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </Modal>
  );
}
