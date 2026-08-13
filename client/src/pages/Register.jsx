import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'warehouse_manager' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-signal text-white font-display font-bold text-lg mb-4">
            IP
          </div>
          <h1 className="font-display text-2xl font-semibold text-ink">Create account</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-xl p-6 shadow-sm space-y-4">
          {error && <div className="bg-critical-dim text-critical text-sm rounded-lg px-3 py-2">{error}</div>}

          <Input label="Name" name="name" required value={form.name} onChange={handleChange} />
          <Input label="Email" name="email" type="email" required value={form.email} onChange={handleChange} />
          <Input label="Password" name="password" type="password" required value={form.password} onChange={handleChange} />

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Role</label>
            <select
              name="role" value={form.role} onChange={handleChange}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-signal bg-surface"
            >
              <option value="warehouse_manager">Warehouse Manager</option>
              <option value="procurement_manager">Procurement Manager</option>
            </select>
            <p className="text-xs text-ink-muted mt-1">Admin accounts are created by an existing admin, not self-registered.</p>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        <p className="text-center text-sm text-ink-muted mt-4">
          Already have an account? <Link to="/login" className="text-signal font-medium">Sign in</Link>
        </p>
        <p className="text-center text-sm text-ink-muted mt-2">
          Are you a supplier? <Link to="/supplier/login" className="text-signal font-medium">Supplier portal</Link>
        </p>
      </div>
    </div>
  );
}