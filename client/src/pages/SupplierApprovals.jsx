import { useEffect, useState } from 'react';
import * as supplierAuthService from '../services/supplierAuthService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function SupplierApprovals() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPending = () => {
    setLoading(true);
    supplierAuthService.getPendingSuppliers().then(setPending).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (id) => {
    setError('');
    try {
      await supplierAuthService.approveSupplier(id);
      fetchPending();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="font-display text-2xl font-semibold text-ink mb-1">Supplier Approvals</h1>
      <p className="text-ink-muted text-sm mb-6">{pending.length} awaiting approval</p>

      {error && <p className="text-critical text-xs mb-4">{error}</p>}

      {loading ? (
        <p className="text-ink-muted text-sm">Loading...</p>
      ) : pending.length === 0 ? (
        <div className="text-center py-16 bg-surface border border-dashed border-border rounded-xl">
          <p className="text-ink-muted text-sm">No suppliers waiting for approval</p>
        </div>
      ) : (
        <div className="space-y-2">
          {pending.map((s) => (
            <Card key={s._id}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-ink text-sm">{s.name}</h3>
                  <p className="text-xs text-ink-muted">{s.loginEmail} {s.contactPhone && '· ' + s.contactPhone}</p>
                  {s.address && <p className="text-xs text-ink-muted">{s.address}</p>}
                </div>
                <Button onClick={() => handleApprove(s._id)}>Approve</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}