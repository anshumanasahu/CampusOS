import FocusSession from '../models/focus-session.js';
import BurnoutRecord from '../models/burnout-record.js';
import Document from '../models/document.js';

const PLAYLISTS = {
  deep_focus: { label: 'Deep Focus', url: 'https://music.amazon.in/search/deep+focus+study' },
  light_focus: { label: 'Light Focus', url: 'https://music.amazon.in/search/light+study+music' },
  relaxation: { label: 'Relaxation', url: 'https://music.amazon.in/search/relaxation+calm+music' },
  recovery: { label: 'Recovery & Rest', url: 'https://music.amazon.in/search/sleep+recovery+music' },
  coding_focus: { label: 'Coding Focus', url: 'https://music.amazon.in/search/coding+focus+music' },
  morning_energy: { label: 'Morning Energy', url: 'https://music.amazon.in/search/morning+energy+music' },
};

/**
 * Determine playlist type based on student state.
 */
const determinePlaylist = (burnoutLevel, sleep, hasExam, isPlacementPrep) => {
  if (burnoutLevel === 'high' || (sleep && sleep < 5)) return 'recovery';
  if (burnoutLevel === 'high') return 'relaxation';
  if (burnoutLevel === 'medium' && !hasExam) return 'light_focus';
  if (isPlacementPrep) return 'coding_focus';
  if (hasExam) return 'deep_focus';

  // Time-based default
  const hour = new Date().getHours();
  if (hour < 10) return 'morning_energy';
  if (hour < 18) return 'deep_focus';
  return 'light_focus';
};

/**
 * Generate a focus recommendation for the user.
 */
export const getRecommendation = async (userId) => {
  // Get burnout data
  const burnout = await BurnoutRecord.findOne({ userId }).sort({ date: -1 }).lean();

  // Check for upcoming exams (within 3 days)
  const now = new Date();
  const threeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const docs = await Document.find({ userId, status: 'confirmed', category: { $in: ['exam', 'placement'] } })
    .select('extractedData category')
    .lean();

  let hasExam = false;
  let isPlacementPrep = false;
  for (const doc of docs) {
    if (!doc.extractedData?.dates) continue;
    for (const d of doc.extractedData.dates) {
      const dueDate = new Date(d.date);
      if (dueDate >= now && dueDate <= threeDays) {
        if (doc.category === 'exam') hasExam = true;
        if (doc.category === 'placement') isPlacementPrep = true;
      }
    }
  }

  const burnoutLevel = burnout?.level || 'low';
  const sleep = burnout?.sleepHours;
  const mood = burnout?.mood;
  const workload = burnout?.workloadEstimate || 5;

  const playlistType = determinePlaylist(burnoutLevel, sleep, hasExam, isPlacementPrep);
  const playlist = PLAYLISTS[playlistType];

  // Build recommendation text
  let recommendation = '';
  let duration = 90;
  let reason = '';

  if (burnoutLevel === 'high') {
    recommendation = 'Take a 30 minute break. Rest is productive too.';
    duration = 30;
    reason = 'High burnout detected';
  } else if (hasExam) {
    recommendation = 'Two 90-minute deep study sessions with 15-minute breaks.';
    duration = 90;
    reason = 'Upcoming exam detected';
  } else if (isPlacementPrep) {
    recommendation = 'One 90-minute focused coding session. Revise one DSA topic.';
    duration = 90;
    reason = 'Placement preparation';
  } else if (burnoutLevel === 'medium') {
    recommendation = 'One 60-minute focused session, then a refreshing break.';
    duration = 60;
    reason = 'Moderate burnout — balance effort with recovery';
  } else {
    recommendation = 'Great energy today! Try a 90-minute deep work session.';
    duration = 90;
    reason = 'Low burnout, optimal for focused work';
  }

  // Save session
  const session = await FocusSession.create({
    userId,
    burnoutLevel,
    workload,
    sleepScore: sleep,
    mood,
    recommendation,
    playlistType,
    duration,
    reason,
  });

  return {
    recommendation,
    duration,
    reason,
    burnoutLevel,
    playlist: {
      type: playlistType,
      label: playlist.label,
      url: playlist.url,
    },
    hasExam,
    isPlacementPrep,
  };
};

/**
 * Get focus history.
 */
export const getHistory = async (userId, filters = {}) => {
  const limit = Math.min(parseInt(filters.limit) || 10, 30);
  const sessions = await FocusSession.find({ userId })
    .sort({ generatedAt: -1 })
    .limit(limit)
    .lean();
  return { sessions };
};

/**
 * Get all available playlists.
 */
export const getPlaylists = () => {
  return { playlists: Object.entries(PLAYLISTS).map(([key, val]) => ({ type: key, ...val })) };
};
