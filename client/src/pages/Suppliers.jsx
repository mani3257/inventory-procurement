import { useEffect, useState } from 'react';
import * as supplierService from '../services/supplierService';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', contactEmail: '', contactPhone: '' });
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', contactEmail: '', contactPhone: '' });
  const [error, setError] = useState('');
  const { user } = useAuth();

  const fetchSuppliers = () => {
    setLoading(true);
    supplierService.getSuppliers().then(setSuppliers).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setCreating(true);
    try {
      await supplierService.createSupplier(form);
      setForm({ name: '', contactEmail: '', contactPhone: '' });
      fetchSuppliers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create supplier');
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (s) => {
    setEditingId(s._id);
    setEditForm({ name: s.name, contactEmail: s.contactEmail || '', contactPhone: s.contactPhone || '' });
  };

  const handleEditSave = async (id) => {
    setError('');
    try {
      await supplierService.updateSupplier(id, editForm);
      setEditingId(null);
      fetchSuppliers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update supplier');
    }
  };

  const canManage = user?.role === 'admin' || user?.role === 'procurement_manager';

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="font-display text-2xl font-semibold text-ink mb-1">Suppliers</h1>
      <p className="text-ink-muted text-sm mb-6">{suppliers.length} suppliers</p>

      {canManage && (
        <Card className="mb-6">
          <p className="text-sm font-medium text-ink mb-3">Add supplier</p>
          <form onSubmit={handleCreate} className="space-y-3">
            {error && <p className="text-critical text-xs">{error}</p>}
            <Input placeholder="Supplier name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input placeholder="Contact email" type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
            <Input placeholder="Contact phone" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />
            <Button type="submit" disabled={creating}>{creating ? 'Adding...' : 'Add supplier'}</Button>
          </form>
        </Card>
      )}

      {loading ? (
        <p className="text-ink-muted text-sm">Loading...</p>
      ) : (
        <div className="space-y-2">
          {suppliers.map((s) => (
            <Card key={s._id}>
              {editingId === s._id ? (
                <div className="space-y-2">
                  <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} placeholder="Name" />
                  <Input value={editForm.contactEmail} onChange={(e) => setEditForm({ ...editForm, contactEmail: e.target.value })} placeholder="Email" />
                  <Input value={editForm.contactPhone} onChange={(e) => setEditForm({ ...editForm, contactPhone: e.target.value })} placeholder="Phone" />
                  <div className="flex gap-2">
                    <Button onClick={() => handleEditSave(s._id)}>Save</Button>
                    <Button variant="secondary" onClick={() => setEditingId(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="font-medium text-ink text-sm">{s.name}</h3>
                  <p className="text-xs text-ink-muted">{s.contactEmail} {s.contactPhone && '· ' + s.contactPhone}</p>
                  {canManage && (
                    <button onClick={() => startEdit(s)} className="text-xs text-signal font-medium mt-2 hover:underline">
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