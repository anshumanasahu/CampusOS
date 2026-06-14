import { useState, useEffect } from 'react';
import { focusService } from '../../services/focus-service.js';
import Card from './card.jsx';
import StatusTag from './status-tag.jsx';
import Button from './button.jsx';

export default function FocusWidget() {
  const [focus, setFocus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await focusService.getRecommendation();
        setFocus(res.data);
      } catch {}
      setLoading(false);
    })();
  }, []);

  if (loading || !focus) return null;

  return (
    <Card title="🎧 Today's Focus">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <StatusTag status={focus.burnoutLevel} />
          {focus.hasExam && <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">Exam Soon</span>}
          {focus.isPlacementPrep && <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">Placement</span>}
        </div>

        <p className="text-sm text-slate-700">{focus.recommendation}</p>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">Duration: {focus.duration} min</p>
            <p className="text-xs text-slate-400">{focus.reason}</p>
          </div>
        </div>

        <a
          href={focus.playlist?.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 mt-1 px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-lg hover:bg-indigo-100 transition-colors"
        >
          🎵 {focus.playlist?.label}
          <span className="text-indigo-400">→ Open on Amazon Music</span>
        </a>
      </div>
    </Card>
  );
}
