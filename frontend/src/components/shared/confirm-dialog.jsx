import Modal from './modal.jsx';
import Button from './button.jsx';

export default function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel }) {
  return (
    <Modal isOpen={isOpen} title={title || 'Confirm'} onClose={onCancel}>
      <p className="text-sm text-slate-600 mb-6">{message || 'Are you sure you want to proceed?'}</p>
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Confirm
        </Button>
      </div>
    </Modal>
  );
}
