import { useEffect, useState } from 'react';
import * as purchaseRequestService from '../services/purchaseRequestService';
import * as productService from '../services/productService';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

const STATUS_COLOR = {
  PENDING: 'amber',
  APPROVED: 'success',
  REJECTED: 'critical'
};

const FILTERS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED'];

export default function PurchaseRequests() {
  const [requests, setRequests] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [qty, setQty] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const fetchData = () => {
    setLoading(true);
    Promise.all([purchaseRequestService.getPurchaseRequests(), productService.getProducts()])
      .then(([r, p]) => {
        setRequests(r);
        setProducts(p);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!selectedProduct || !qty) return;
    setError('');
    setCreating(true);
    try {
      await purchaseRequestService.createPurchaseRequest({
        product: selectedProduct,
        requestedQty: Number(qty)
      });
      setSelectedProduct('');
      setQty('');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create request');
    } finally {
      setCreating(false);
    }
  };

  const handleReview = async (id, decision) => {
    try {
      await purchaseRequestService.reviewPurchaseRequest(id, decision);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to review request');
    }
  };

  const canCreate = user?.role === 'admin' || user?.role === 'warehouse_manager';
  const canReview = user?.role === 'admin' || user?.role === 'procurement_manager';

  const filtered = filter === 'ALL' ? requests : requests.filter((r) => r.status === filter);
  const counts = {
    ALL: requests.length,
    PENDING: requests.filter((r) => r.status === 'PENDING').length,
    APPROVED: requests.filter((r) => r.status === 'APPROVED').length,
    REJECTED: requests.filter((r) => r.status === 'REJECTED').length
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="font-display text-2xl font-semibold text-ink mb-1">Purchase Requests</h1>
      <p className="text-ink-muted text-sm mb-6">{requests.length} total</p>

      {canCreate && (
        <Card className="mb-6">
          <p className="text-sm font-medium text-ink mb-3">New request</p>
          <form onSubmit={handleCreate} className="flex gap-2 items-end flex-wrap">
            {error && <p className="text-critical text-xs w-full">{error}</p>}
            <div className="flex-1 min-w-[180px]">
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                required
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-signal bg-surface"
              >
                <option value="">Select product...</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>{p.name} ({p.sku}) — {p.warehouse?.name}</option>
                ))}
              </select>
            </div>
            <input
              type="number" min="1" placeholder="Qty" value={qty} onChange={(e) => setQty(e.target.value)}
              required
              className="w-24 rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-signal"
            />
            <Button type="submit" disabled={creating}>{creating ? 'Sending...' : 'Request'}</Button>
          </form>
        </Card>
      )}

      <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={
              'shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition ' +
              (filter === f ? 'bg-ink text-white' : 'bg-surface border border-border text-ink-muted hover:text-ink')
            }
          >
            {f} ({counts[f]})
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-ink-muted text-sm">Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-surface border border-dashed border-border rounded-xl">
          <p className="text-ink-muted text-sm">No {filter !== 'ALL' ? filter.toLowerCase() : ''} requests</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => (
            <Card key={r._id}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-ink text-sm">
                    {r.product?.name} <span className="font-mono text-xs text-ink-muted">({r.product?.sku})</span>
                  </h3>
                  <p className="text-xs text-ink-muted mt-0.5">
                    Requested {r.requestedQty} units by {r.requestedBy?.name}
                  </p>
                  {r.approvedBy && (
                    <p className="text-xs text-ink-muted">Reviewed by {r.approvedBy.name}</p>
                  )}
                  <p className="text-xs text-ink-muted font-mono mt-1">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge color={STATUS_COLOR[r.status]}>{r.status}</Badge>
              </div>

              {canReview && r.status === 'PENDING' && (
                <div className="flex gap-2 mt-3">
                  <Button variant="secondary" onClick={() => handleReview(r._id, 'APPROVED')}>Approve</Button>
                  <Button variant="danger" onClick={() => handleReview(r._id, 'REJECTED')}>Reject</Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}