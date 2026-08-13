import { useEffect, useState } from 'react';
import * as warehouseService from '../services/warehouseService';
import * as productService from '../services/productService';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', location: '' });
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', location: '' });
  const [error, setError] = useState('');
  const { user } = useAuth();

  const fetchData = () => {
    setLoading(true);
    Promise.all([warehouseService.getWarehouses(), productService.getProducts()])
      .then(([w, p]) => {
        setWarehouses(w);
        setProducts(p);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setCreating(true);
    try {
      await warehouseService.createWarehouse(form);
      setForm({ name: '', location: '' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create warehouse');
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (w) => {
    setEditingId(w._id);
    setEditForm({ name: w.name, location: w.location });
  };

  const handleEditSave = async (id) => {
    setError('');
    try {
      await warehouseService.updateWarehouse(id, editForm);
      setEditingId(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update warehouse');
    }
  };

  const productCountFor = (warehouseId) =>
    products.filter((p) => p.warehouse?._id === warehouseId).length;

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="font-display text-2xl font-semibold text-ink mb-1">Warehouses</h1>
      <p className="text-ink-muted text-sm mb-6">{warehouses.length} locations</p>

      {user?.role === 'admin' && (
        <Card className="mb-6">
          <p className="text-sm font-medium text-ink mb-3">Add warehouse</p>
          <form onSubmit={handleCreate} className="flex gap-2 items-end flex-wrap">
            {error && <p className="text-critical text-xs w-full">{error}</p>}
            <div className="flex-1 min-w-[140px]">
              <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="flex-1 min-w-[140px]">
              <Input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
            </div>
            <Button type="submit" disabled={creating}>{creating ? 'Adding...' : 'Add'}</Button>
          </form>
        </Card>
      )}

      {loading ? (
        <p className="text-ink-muted text-sm">Loading...</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {warehouses.map((w) => (
            <Card key={w._id}>
              {editingId === w._id ? (
                <div className="space-y-2">
                  <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} placeholder="Name" />
                  <Input value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} placeholder="Location" />
                  <div className="flex gap-2">
                    <Button onClick={() => handleEditSave(w._id)}>Save</Button>
                    <Button variant="secondary" onClick={() => setEditingId(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="font-medium text-ink text-sm">{w.name}</h3>
                  <p className="text-xs text-ink-muted mt-0.5">{w.location}</p>
                  <p className="text-xs text-ink-muted mt-2">{productCountFor(w._id)} product records</p>
                  {user?.role === 'admin' && (
                    <button onClick={() => startEdit(w)} className="text-xs text-signal font-medium mt-2 hover:underline">
                      Edit
                    </button>
                  )}
                </>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}