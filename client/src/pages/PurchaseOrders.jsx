import { useEffect, useState } from 'react';
import * as purchaseOrderService from '../services/purchaseOrderService';
import * as purchaseRequestService from '../services/purchaseRequestService';
import * as supplierService from '../services/supplierService';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

const FILTERS = ['ALL', 'ORDERED', 'RECEIVED'];

export default function PurchaseOrders() {
  const [orders, setOrders] = useState([]);
  const [approvedRequests, setApprovedRequests] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [selectedRequest, setSelectedRequest] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [qty, setQty] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      purchaseOrderService.getPurchaseOrders(),
      purchaseRequestService.getPurchaseRequests(),
      supplierService.getSuppliers()
    ])
      .then(([orders, requests, sup]) => {
        setOrders(orders);
        setApprovedRequests(requests.filter((r) => r.status === 'APPROVED'));
        setSuppliers(sup);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!selectedRequest || !selectedSupplier || !qty) return;
    setError('');
    setCreating(true);
    try {
      await purchaseOrderService.createPurchaseOrder({
        purchaseRequest: selectedRequest,
        supplier: selectedSupplier,
        quantity: Number(qty)
      });
      setSelectedRequest('');
      setSelectedSupplier('');
      setQty('');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create order');
    } finally {
      setCreating(false);
    }
  };

  const handleReceive = async (id) => {
    setError('');
    try {
      await purchaseOrderService.receivePurchaseOrder(id);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to receive order');
    }
  };

  const canCreate = user?.role === 'admin' || user?.role === 'procurement_manager';
  const canReceive = user?.role === 'admin' || user?.role === 'warehouse_manager';

  const filtered = filter === 'ALL' ? orders : orders.filter((o) => o.status === filter);
  const counts = {
    ALL: orders.length,
    ORDERED: orders.filter((o) => o.status === 'ORDERED').length,
    RECEIVED: orders.filter((o) => o.status === 'RECEIVED').length
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="font-display text-2xl font-semibold text-ink mb-1">Purchase Orders</h1>
      <p className="text-ink-muted text-sm mb-6">{orders.length} total</p>

      {canCreate && (
        <Card className="mb-6">
          <p className="text-sm font-medium text-ink mb-3">New order (from an approved request)</p>
          <form onSubmit={handleCreate} className="space-y-2">
            {error && <p className="text-critical text-xs">{error}</p>}
            <select
              value={selectedRequest}
              onChange={(e) => setSelectedRequest(e.target.value)}
              required
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-signal bg-surface"
            >
              <option value="">Select approved request...</option>
              {approvedRequests.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.product?.name} ({r.product?.sku}) — requested {r.requestedQty}
                </option>
              ))}
            </select>
            <div className="flex gap-2 items-end flex-wrap">
              <div className="flex-1 min-w-[160px]">
                <select
                  value={selectedSupplier}
                  onChange={(e) => setSelectedSupplier(e.target.value)}
                  required
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-signal bg-surface"
                >
                  <option value="">Select supplier...</option>
                  {suppliers.map((s) => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <input
                type="number" min="1" placeholder="Qty" value={qty} onChange={(e) => setQty(e.target.value)}
                required
                className="w-24 rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-signal"
              />
              <Button type="submit" disabled={creating}>{creating ? 'Ordering...' : 'Create Order'}</Button>
            </div>
          </form>
          {approvedRequests.length === 0 && (
            <p className="text-xs text-ink-muted mt-2">No approved requests waiting for an order.</p>
          )}
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
          <p className="text-ink-muted text-sm">No {filter !== 'ALL' ? filter.toLowerCase() : ''} orders</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((o) => (
            <Card key={o._id}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-ink text-sm">
                    {o.product?.name} <span className="font-mono text-xs text-ink-muted">({o.product?.sku})</span>
                  </h3>
                  <p className="text-xs text-ink-muted mt-0.5">
                    {o.quantity} units from {o.supplier?.name} · ordered by {o.orderedBy?.name}
                  </p>
                  <p className="text-xs text-ink-muted font-mono mt-1">
                    Ordered {new Date(o.createdAt).toLocaleDateString()}
                    {o.receivedAt && ' · Received ' + new Date(o.receivedAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge color={o.status === 'RECEIVED' ? 'success' : 'amber'}>{o.status}</Badge>
              </div>

              {canReceive && o.status === 'ORDERED' && (
                <div className="mt-3">
                  <Button variant="secondary" onClick={() => handleReceive(o._id)}>Mark as Received</Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}