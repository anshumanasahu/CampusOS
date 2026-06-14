import mongoose from 'mongoose';

const timetableSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
      maxlength: 200,
    },
    code: {
      type: String,
      default: null,
      trim: true,
      maxlength: 20,
    },
    faculty: {
      type: String,
      default: null,
      trim: true,
      maxlength: 100,
    },
    day: {
      type: String,
      required: [true, 'Day is required'],
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Start time must be in HH:mm format'],
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'End time must be in HH:mm format'],
    },
    room: {
      type: String,
      default: null,
      trim: true,
      maxlength: 50,
    },
    targetThreshold: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },
    notes: {
      type: String,
      default: null,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

timetableSchema.index({ userId: 1, day: 1 });
timetableSchema.index({ userId: 1, name: 1 });

const Timetable = mongoose.model('Timetable', timetableSchema);
export default Timetable;
