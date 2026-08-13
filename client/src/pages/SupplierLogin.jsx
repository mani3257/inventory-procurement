import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as supplierAuthService from '../services/supplierAuthService';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function SupplierLogin() {
  const [loginEmail, setLoginEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await supplierAuthService.supplierLogin(loginEmail, password);
      localStorage.setItem('supplierToken', data.token);
      localStorage.setItem('supplier', JSON.stringify(data.supplier));
      navigate('/supplier/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-amber text-white font-display font-bold text-lg mb-4">
            SP
          </div>
          <h1 className="font-display text-2xl font-semibold text-ink">Supplier Portal</h1>
          <p className="text-ink-muted text-sm mt-1">Sign in to view your orders</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-xl p-6 shadow-sm space-y-4">
          {error && <div className="bg-critical-dim text-critical text-sm rounded-lg px-3 py-2">{error}</div>}

          <Input label="Login email" type="email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
          <Input label="Password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <p className="text-center text-sm text-ink-muted mt-4">
          New supplier? <Link to="/supplier/register" className="text-signal font-medium">Register</Link>
        </p>
        <p className="text-center text-sm text-ink-muted mt-2">
          <Link to="/login" className="text-signal font-medium">Staff sign in</Link>
        </p>
      </div>
    </div>
  );
}