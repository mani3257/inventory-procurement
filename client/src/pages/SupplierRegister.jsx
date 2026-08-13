import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as supplierAuthService from '../services/supplierAuthService';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function SupplierRegister() {
  const [form, setForm] = useState({ name: '', loginEmail: '', password: '', contactPhone: '', address: '' });
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await supplierAuthService.supplierRegister(form);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas px-4">
        <div className="w-full max-w-sm text-center bg-surface border border-border rounded-xl p-6">
          <h1 className="font-display text-xl font-semibold text-ink mb-2">Registration submitted</h1>
          <p className="text-sm text-ink-muted mb-4">An admin needs to approve your account before you can log in. You'll be able to sign in once approved.</p>
          <Link to="/supplier/login" className="text-signal font-medium text-sm">Back to sign in</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-amber text-white font-display font-bold text-lg mb-4">
            SP
          </div>
          <h1 className="font-display text-2xl font-semibold text-ink">Register as supplier</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-xl p-6 shadow-sm space-y-4">
          {error && <div className="bg-critical-dim text-critical text-sm rounded-lg px-3 py-2">{error}</div>}

          <Input label="Company name" name="name" required value={form.name} onChange={handleChange} />
          <Input label="Login email" name="loginEmail" type="email" required value={form.loginEmail} onChange={handleChange} />
          <Input label="Password" name="password" type="password" required value={form.password} onChange={handleChange} />
          <Input label="Contact phone" name="contactPhone" value={form.contactPhone} onChange={handleChange} />
          <Input label="Address" name="address" value={form.address} onChange={handleChange} />

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Submitting...' : 'Register'}
          </Button>
        </form>

        <p className="text-center text-sm text-ink-muted mt-4">
          Already registered? <Link to="/supplier/login" className="text-signal font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}