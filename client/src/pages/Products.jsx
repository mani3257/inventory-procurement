import { useEffect, useState } from 'react';
import * as productService from '../services/productService';
import * as warehouseService from '../services/warehouseService';
import * as stockService from '../services/stockService';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const MOVEMENT_LABELS = {
  PURCHASE: 'Purchase',
  SALE: 'Sale',
  TRANSFER_OUT: 'Transfer out',
  TRANSFER_IN: 'Transfer in',
  RETURN: 'Return',
  DAMAGE: 'Damage'
};

function LedgerPanel({ productId }) {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    stockService.getStockLedger(productId).then(setMovements).finally(() => setLoading(false));
  }, [productId]);

  if (loading) return <p className="text-xs text-ink-muted px-1 py-2">Loading history...</p>;
  if (movements.length === 0) return <p className="text-xs text-ink-muted px-1 py-2">No movements yet.</p>;

  return (
    <div className="border-t border-border mt-3 pt-3 space-y-2">
      {movements.map((m) => (
        <div key={m._id} className="flex items-center justify-between text-xs">
          <span className="text-ink">
            {MOVEMENT_LABELS[m.type] || m.type}
            <span className={m.quantity >= 0 ? 'text-success' : 'text-critical'}> {m.quantity >= 0 ? '+' : ''}{m.quantity}</span>
          </span>
          <span className="text-ink-muted font-mono">{new Date(m.date).toLocaleDateString()}</span>
        </div>
      ))}
    </div>
  );
}

function TransferModal({ product, warehouses, onClose, onDone }) {
  const [destination, setDestination] = useState('');
  const [quantity, setQuantity] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const otherWarehouses = warehouses.filter((w) => w._id !== product.warehouse?._id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await stockService.transferStock({
        sourceProductId: product._id,
        destinationWarehouseId: destination,
        quantity: Number(quantity)
      });
      onDone();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Transfer failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 px-4" onClick={onClose}>
      <div className="bg-surface rounded-xl shadow-xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-display text-lg font-semibold text-ink mb-1">Transfer stock</h2>
        <p className="text-xs text-ink-muted mb-4">{product.name} · currently {product.currentStock} at {product.warehouse?.name}</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <p className="text-critical text-xs">{error}</p>}
          <select
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            required
            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-signal bg-surface"
          >
            <option value="">Destination warehouse...</option>
            {otherWarehouses.map((w) => (
              <option key={w._id} value={w._id}>{w.name}</option>
            ))}
          </select>
          <Input type="number" min="1" max={product.currentStock} placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={saving} className="flex-1">{saving ? 'Transferring...' : 'Transfer'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [transferProduct, setTransferProduct] = useState(null);
  const [expandedLedgerId, setExpandedLedgerId] = useState(null);
  const [form, setForm] = useState({ name: '', sku: '', category: '', minimumStock: '', currentStock: '', warehouse: '' });
  const [editForm, setEditForm] = useState({ name: '', category: '', minimumStock: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const fetchData = () => {
    setLoading(true);
    Promise.all([productService.getProducts(), warehouseService.getWarehouses()])
      .then(([p, w]) => {
        setProducts(p);
        setWarehouses(w);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await productService.createProduct({
        ...form,
        minimumStock: Number(form.minimumStock) || 0,
        currentStock: Number(form.currentStock) || 0
      });
      setForm({ name: '', sku: '', category: '', minimumStock: '', currentStock: '', warehouse: '' });
      setShowCreate(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create product');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (p) => {
    setEditingId(p._id);
    setEditForm({ name: p.name, category: p.category || '', minimumStock: p.minimumStock });
  };

  const handleEditSave = async (id) => {
    setSaving(true);
    setError('');
    try {
      await productService.updateProduct(id, { ...editForm, minimumStock: Number(editForm.minimumStock) });
      setEditingId(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  const toggleLedger = (id) => setExpandedLedgerId(expandedLedgerId === id ? null : id);

  const lowStockCount = products.filter((p) => p.isLowStock).length;
  const canManage = user?.role === 'admin';
  const canTransfer = user?.role === 'admin' || user?.role === 'warehouse_manager';

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Products</h1>
          <p className="text-ink-muted text-sm mt-1">
            {products.length} total
            {lowStockCount > 0 && <span className="text-critical font-medium"> · {lowStockCount} low stock</span>}
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setShowCreate(!showCreate)}>{showCreate ? 'Cancel' : '+ New product'}</Button>
        )}
      </div>

      {showCreate && (
        <Card className="mb-6">
          <p className="text-sm font-medium text-ink mb-3">New product</p>
          <form onSubmit={handleCreate} className="grid grid-cols-2 gap-3">
            {error && <p className="text-critical text-xs col-span-2">{error}</p>}
            <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required />
            <Input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            <select
              value={form.warehouse}
              onChange={(e) => setForm({ ...form, warehouse: e.target.value })}
              required
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-signal bg-surface"
            >
              <option value="">Select warehouse...</option>
              {warehouses.map((w) => (
                <option key={w._id} value={w._id}>{w.name}</option>
              ))}
            </select>
            <Input type="number" placeholder="Minimum stock" value={form.minimumStock} onChange={(e) => setForm({ ...form, minimumStock: e.target.value })} />
            <Input type="number" placeholder="Current stock" value={form.currentStock} onChange={(e) => setForm({ ...form, currentStock: e.target.value })} />
            <div className="col-span-2">
              <Button type="submit" disabled={saving}>{saving ? 'Creating...' : 'Create product'}</Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <p className="text-ink-muted text-sm">Loading products...</p>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-surface border border-dashed border-border rounded-xl">
          <p className="text-ink-muted text-sm">No products yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {products.map((p) => (
            <Card key={p._id} className={p.isLowStock ? 'border-critical/40' : ''}>
              {editingId === p._id ? (
                <div className="space-y-2">
                  <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} placeholder="Name" />
                  <Input value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} placeholder="Category" />
                  <Input type="number" value={editForm.minimumStock} onChange={(e) => setEditForm({ ...editForm, minimumStock: e.target.value })} placeholder="Minimum stock" />
                  <div className="flex gap-2">
                    <Button onClick={() => handleEditSave(p._id)} disabled={saving}>Save</Button>
                    <Button variant="secondary" onClick={() => setEditingId(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-mono text-xs text-ink-muted">{p.sku}</span>
                    {p.isLowStock ? <Badge color="critical">Low Stock</Badge> : <Badge color="success">In Stock</Badge>}
                  </div>
                  <h3 className="font-medium text-ink text-sm">{p.name}</h3>
                  <p className="text-xs text-ink-muted mb-2">{p.category} · {p.warehouse?.name}</p>
                  <p className="text-xs text-ink">
                    <span className="font-mono font-medium">{p.currentStock}</span>
                    <span className="text-ink-muted"> / {p.minimumStock} min</span>
                  </p>

                  <div className="flex gap-3 mt-2 flex-wrap items-center">
                    {canManage && (
                      <button onClick={() => startEdit(p)} className="text-xs text-signal font-medium hover:underline">Edit</button>
                    )}
                    {canTransfer && (
                      <button onClick={() => setTransferProduct(p)} className="text-xs text-signal font-medium hover:underline">Transfer</button>
                    )}
                    <button onClick={() => toggleLedger(p._id)} className="text-xs text-signal font-medium hover:underline">
                      {expandedLedgerId === p._id ? 'Hide history' : 'View history'}
                    </button>
                  </div>

                  {expandedLedgerId === p._id && <LedgerPanel productId={p._id} />}
                </>
              )}
            </Card>
          ))}
        </div>
      )}

      {transferProduct && (
        <TransferModal
          product={transferProduct}
          warehouses={warehouses}
          onClose={() => setTransferProduct(null)}
          onDone={fetchData}
        />
      )}
    </div>
  );
}