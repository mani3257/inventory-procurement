import { useEffect, useState } from 'react';
import * as userService from '../services/userService';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

const ROLE_STYLES = {
  admin: 'signal',
  warehouse_manager: 'amber',
  procurement_manager: 'success'
};

const ROLE_LABELS = {
  admin: 'Admin',
  warehouse_manager: 'Warehouse Manager',
  procurement_manager: 'Procurement Manager'
};

export default function Team() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    userService.getUsers().then(setUsers).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'ALL' ? users : users.filter((u) => u.role === filter);

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="font-display text-2xl font-semibold text-ink mb-1">Team</h1>
      <p className="text-ink-muted text-sm mb-6">{users.length} people</p>

      <div className="flex gap-1.5 mb-5">
        {['ALL', 'admin', 'warehouse_manager', 'procurement_manager'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={
              'px-3 py-1.5 rounded-lg text-xs font-medium transition ' +
              (filter === f ? 'bg-ink text-white' : 'bg-surface border border-border text-ink-muted hover:text-ink')
            }
          >
            {f === 'ALL' ? 'All' : ROLE_LABELS[f]}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-ink-muted text-sm">Loading...</p>
      ) : (
        <div className="bg-surface border border-border rounded-xl divide-y divide-border">
          {filtered.map((u) => (
            <div key={u._id} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-canvas flex items-center justify-center text-xs font-medium text-ink-muted">
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-ink">{u.name}</p>
                  <p className="text-xs text-ink-muted">{u.email}</p>
                </div>
              </div>
              <Badge color={ROLE_STYLES[u.role]}>{ROLE_LABELS[u.role]}</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}