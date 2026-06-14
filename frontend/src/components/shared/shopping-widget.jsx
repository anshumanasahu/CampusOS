import { useState, useEffect } from 'react';
import { shoppingService } from '../../services/shopping-service.js';
import Card from './card.jsx';
import Badge from './badge.jsx';

export default function ShoppingWidget() {
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [itemsRes, summaryRes] = await Promise.all([
          shoppingService.getItems(),
          shoppingService.getSummary(),
        ]);
        setItems(itemsRes.data.items || []);
        setSummary(summaryRes.data);
      } catch {}
      setLoading(false);
    })();
  }, []);

  if (loading) return null;

  const purchased = items.filter((i) => i.purchased);
  const pending = items.filter((i) => !i.purchased);

  if (purchased.length === 0 && pending.length === 0) return null;

  return (
    <Card title="🛒 Student Essentials">
      <div className="space-y-3">
        {/* Already Purchased */}
        {purchased.length > 0 && (
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Already Purchased</p>
            <div className="space-y-1">
              {purchased.map((item) => (
                <div key={item._id} className="flex items-center gap-2 text-sm text-slate-500">
                  <span className="text-green-500">✓</span>
                  <span className="line-through">{item.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Still Needed */}
        {pending.length > 0 && (
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Still Needed</p>
            <div className="space-y-1.5">
              {pending.map((item) => (
                <div key={item._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge
                      text={item.priority === 'high' ? '!' : item.priority === 'medium' ? '•' : '○'}
                      variant={item.priority === 'high' ? 'danger' : item.priority === 'medium' ? 'warning' : 'neutral'}
                    />
                    <span className="text-sm text-slate-700">{item.title}</span>
                    {item.estimatedCost && (
                      <span className="text-xs text-slate-400">₹{item.estimatedCost}</span>
                    )}
                  </div>
                  <a
                    href={item.amazonSearchUrl || `https://www.amazon.in/s?k=${encodeURIComponent(item.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-indigo-600 hover:underline shrink-0 whitespace-nowrap"
                  >
                    Search on Amazon →
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Budget Summary */}
        {summary && (
          <div className="pt-2 border-t border-slate-100 flex justify-between text-xs">
            <span className="text-slate-500">
              Est. Cost: <strong className="text-slate-700">₹{summary.estimatedCost || 0}</strong>
            </span>
            <span className={summary.canAfford ? 'text-green-600' : 'text-red-500'}>
              Budget: ₹{summary.budgetRemaining || 0} {summary.canAfford ? '✓ Affordable' : '⚠ Tight'}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
