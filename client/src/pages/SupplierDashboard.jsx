import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as supplierAuthService from '../services/supplierAuthService';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

export default function SupplierDashboard() {
  const [supplier, setSupplier] = useState(() => {
    const saved = localStorage.getItem('supplier');
    return saved ? JSON.parse(saved) : null;
  });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('supplierToken')) {
      navigate('/supplier/login');
      return;
    }
    supplierAuthService.getMySupplierOrders().then(setOrders).finally(() => setLoading(false));
  }, []);

  const logout = () => {
    localStorage.removeItem('supplierToken');
    localStorage.removeItem('supplier');
    navigate('/supplier/login');
  };

  return (
    <div className="min-h-screen bg-canvas">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink">Welcome, {supplier?.name}</h1>
            <p className="text-ink-muted text-sm mt-1">{orders.length} purchase orders placed with you</p>
          </div>
          <button onClick={logout} className="text-sm text-ink-muted hover:text-critical">Sign out</button>
        </div>

        {loading ? (
          <p className="text-ink-muted text-sm">Loading...</p>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 bg-surface border border-dashed border-border rounded-xl">
            <p className="text-ink-muted text-sm">No orders yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {orders.map((o) => (
              <Card key={o._id}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-ink text-sm">{o.product?.name} <span className="font-mono text-xs text-ink-muted">({o.product?.sku})</span></h3>
                    <p className="text-xs text-ink-muted mt-0.5">{o.quantity} units</p>
                    <p className="text-xs text-ink-muted font-mono mt-1">Ordered {new Date(o.createdAt).toLocaleDateString()}</p>
                  </div>
                  <Badge color={o.status === 'RECEIVED' ? 'success' : 'amber'}>{o.status}</Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}