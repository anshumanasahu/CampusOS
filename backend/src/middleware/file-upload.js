import multer from 'multer';
import AppError from '../utils/app-error.js';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'text/csv',
  'text/plain',
];

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        'File type not allowed. Accepted: PDF, DOCX, CSV, TXT',
        400,
        'VALIDATION_ERROR'
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

export default upload;
